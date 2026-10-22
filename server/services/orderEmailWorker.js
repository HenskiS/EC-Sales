const { randomUUID } = require('crypto')
const OrderModel = require('../models/Orders')
const sendEmail = require('../middleware/emailHandler')

const POLL_INTERVAL_MS = Number(process.env.EMAIL_WORKER_POLL_MS) || 10000
const STALE_LOCK_MS = Number(process.env.EMAIL_WORKER_STALE_MS) || 5 * 60 * 1000
const MAX_ATTEMPTS = Number(process.env.EMAIL_MAX_ATTEMPTS) || 5
const MAX_ERROR_LENGTH = 2000
const RETRY_DELAYS_MS = [30_000, 2 * 60_000, 10 * 60_000, 60 * 60_000]

let pollTimer
let activeRun
let stopping = true

const retryDelay = (attempts) => (
    RETRY_DELAYS_MS[Math.min(Math.max(attempts - 1, 0), RETRY_DELAYS_MS.length - 1)]
)

const errorMessage = (error) => {
    if (!error) return 'Unknown email delivery error'
    if (typeof error === 'string') return error.slice(0, MAX_ERROR_LENGTH)
    const message = error.message || JSON.stringify(error)
    return String(message).slice(0, MAX_ERROR_LENGTH)
}

const isRetryable = (error) => {
    if (error?.retryable === false) return false
    const status = Number(error?.statusCode || error?.status)
    if (!status) return true
    return status === 408 || status === 409 || status === 429 || status >= 500
}

const claimNextOrder = async () => {
    const now = new Date()
    const staleBefore = new Date(now.getTime() - STALE_LOCK_MS)
    const lockId = randomUUID()

    return OrderModel.findOneAndUpdate(
        {
            $or: [
                {
                    'emailDelivery.status': 'pending',
                    'emailDelivery.attempts': { $lt: MAX_ATTEMPTS },
                    $or: [
                        { 'emailDelivery.nextAttemptAt': { $lte: now } },
                        { 'emailDelivery.nextAttemptAt': null },
                    ],
                },
                {
                    // Always reclaim an abandoned lease. If this recovered
                    // attempt throws, markFailed will enforce MAX_ATTEMPTS.
                    'emailDelivery.status': 'processing',
                    'emailDelivery.lockedAt': { $lte: staleBefore },
                },
            ],
        },
        {
            $set: {
                'emailDelivery.status': 'processing',
                'emailDelivery.lockedAt': now,
                'emailDelivery.lockId': lockId,
                'emailDelivery.lastAttemptAt': now,
            },
            $inc: { 'emailDelivery.attempts': 1 },
        },
        { new: true, sort: { 'emailDelivery.nextAttemptAt': 1, _id: 1 } },
    )
}

const markSent = async (order, result) => {
    const warnings = result.dropped.map(entry => `${entry.source}: ${entry.value}`)
    await OrderModel.updateOne(
        {
            _id: order._id,
            'emailDelivery.lockId': order.emailDelivery.lockId,
        },
        {
            $set: {
                'emailDelivery.status': 'sent',
                'emailDelivery.sentAt': new Date(),
                'emailDelivery.resendId': result.resendId || '',
                'emailDelivery.recipients': result.recipients,
                'emailDelivery.warnings': warnings,
                'emailDelivery.lastError': '',
                'emailDelivery.nextAttemptAt': null,
                'emailDelivery.lockedAt': null,
                'emailDelivery.lockId': '',
            },
        },
    )
}

const markFailed = async (order, error) => {
    const attempts = order.emailDelivery.attempts
    const retry = isRetryable(error) && attempts < MAX_ATTEMPTS
    const nextAttemptAt = retry ? new Date(Date.now() + retryDelay(attempts)) : null

    await OrderModel.updateOne(
        {
            _id: order._id,
            'emailDelivery.lockId': order.emailDelivery.lockId,
        },
        {
            $set: {
                'emailDelivery.status': retry ? 'pending' : 'failed',
                'emailDelivery.lastError': errorMessage(error),
                'emailDelivery.nextAttemptAt': nextAttemptAt,
                'emailDelivery.lockedAt': null,
                'emailDelivery.lockId': '',
            },
        },
    )

    console.error(
        `Email delivery ${retry ? 'will retry' : 'failed permanently'} for order ${order._id}`,
        retry ? `at ${nextAttemptAt.toISOString()}:` : ':',
        error,
    )
}

const processOrder = async (order) => {
    try {
        const orderData = order.toObject()
        orderData.emails = order.emailRecipients || []
        const result = await sendEmail(orderData, null, order._id.toString(), order.filename)
        await markSent(order, result)
    } catch (error) {
        await markFailed(order, error)
    }
}

const drainQueue = async () => {
    while (!stopping) {
        const order = await claimNextOrder()
        if (!order) break
        await processOrder(order)
    }
}

const wakeOrderEmailWorker = () => {
    if (stopping || activeRun) return activeRun

    activeRun = drainQueue()
        .catch(error => console.error('Order email worker error:', error))
        .finally(() => {
            activeRun = null
        })
    return activeRun
}

const startOrderEmailWorker = () => {
    if (!stopping) return
    stopping = false
    pollTimer = setInterval(wakeOrderEmailWorker, POLL_INTERVAL_MS)
    pollTimer.unref?.()
    wakeOrderEmailWorker()
    console.log(`Order email worker started (max attempts: ${MAX_ATTEMPTS})`)
}

const stopOrderEmailWorker = async () => {
    stopping = true
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
    if (activeRun) await activeRun
    console.log('Order email worker stopped')
}

module.exports = {
    startOrderEmailWorker,
    stopOrderEmailWorker,
    wakeOrderEmailWorker,
}
