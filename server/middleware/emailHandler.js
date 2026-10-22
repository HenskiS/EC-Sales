require('dotenv').config()
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { Resend } = require('resend')
const file = require('../config/tax.json');
const { EMAIL_RE, buildRecipients } = require('./emailRecipients')

// DigitalOcean blocks outbound SMTP (25/465/587), so we send over Resend's
// HTTPS API (port 443) instead. Sender must be on a Resend-verified domain.
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_ADDRESS = process.env.EMAIL_FROM || "orders@ecsales.work"
// Where replies go when a salesman has no email on file.
const REPLY_TO_FALLBACK = "estebancarrerassales@gmail.com"
const PDF_BASE_URL = (process.env.PDF_BASE_URL || 'https://ecsales.work').replace(/\/$/, '')
const PDF_RENDER_TIMEOUT_MS = Number(process.env.PDF_RENDER_TIMEOUT_MS) || 30000
const BROWSER_CLOSE_TIMEOUT_MS = 5000

const permanentError = (message) => {
    const error = new Error(message)
    error.retryable = false
    return error
}

const withTimeout = (promise, timeoutMs, message) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs)
    Promise.resolve(promise).then(
        value => {
            clearTimeout(timer)
            resolve(value)
        },
        error => {
            clearTimeout(timer)
            reject(error)
        },
    )
})

const closeBrowser = async (browser, orderId) => {
    if (!browser) return

    const browserProcess = browser.process()
    try {
        await withTimeout(
            browser.close(),
            BROWSER_CLOSE_TIMEOUT_MS,
            `Chromium did not close within ${BROWSER_CLOSE_TIMEOUT_MS}ms`,
        )
    } catch (error) {
        console.error(`Chromium cleanup failed for order ${orderId}:`, error.message)
        if (browserProcess && !browserProcess.killed) {
            try {
                browserProcess.kill('SIGKILL')
                console.error(`Force-killed Chromium for order ${orderId}`)
            } catch (killError) {
                console.error(`Unable to force-kill Chromium for order ${orderId}:`, killError.message)
            }
        }
    }
}

const generatePDF = async (filename, id) => {
    const ordersDirectory = path.resolve(process.cwd(), 'orders')
    const pdfPath = path.join(ordersDirectory, filename)

    // Reuse the same PDF on retries. This avoids needless Chromium work and
    // keeps a retried Resend request identical if its first response was lost.
    if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).size > 0) return pdfPath

    fs.mkdirSync(ordersDirectory, { recursive: true })
    const temporaryPath = `${pdfPath}.${process.pid}.${Date.now()}.tmp`
    const printUrl = `${PDF_BASE_URL}/printorder/${id}`
    let browser
    let orderApiFailure = ''
    let lastRequestFailure = ''

    try {
        browser = await puppeteer.launch({
            headless: true,
            protocolTimeout: PDF_RENDER_TIMEOUT_MS + 15000,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ],
        })

        const page = await browser.newPage()
        page.setDefaultTimeout(PDF_RENDER_TIMEOUT_MS)
        page.on('response', response => {
            if (response.url().includes(`/api/orders/orderbyid/${id}`) && !response.ok()) {
                orderApiFailure = `${response.status()} ${response.statusText()}`
            }
        })
        page.on('requestfailed', request => {
            lastRequestFailure = `${request.url()}: ${request.failure()?.errorText || 'request failed'}`
        })
        page.on('pageerror', error => {
            console.error(`Print page error for order ${id}:`, error.message)
        })

        const response = await page.goto(printUrl, {
            waitUntil: 'domcontentloaded',
            timeout: PDF_RENDER_TIMEOUT_MS,
        })
        if (!response || !response.ok()) {
            throw new Error(`Print page returned ${response?.status() || 'no response'}`)
        }

        await page.waitForSelector('h1.order-pdf-header', { timeout: PDF_RENDER_TIMEOUT_MS })
        await page.pdf({ format: 'a4', path: temporaryPath })
        fs.renameSync(temporaryPath, pdfPath)
        return pdfPath
    } catch (error) {
        const diagnostics = [
            orderApiFailure && `order API: ${orderApiFailure}`,
            lastRequestFailure && `request: ${lastRequestFailure}`,
        ].filter(Boolean).join('; ')
        const suffix = diagnostics ? ` (${diagnostics})` : ''
        throw new Error(`PDF generation failed for order ${id}: ${error.message}${suffix}`, { cause: error })
    } finally {
        if (fs.existsSync(temporaryPath)) {
            try {
                fs.unlinkSync(temporaryPath)
            } catch (error) {
                console.error(`Unable to remove temporary PDF for order ${id}:`, error.message)
            }
        }
        await closeBrowser(browser, id)
    }
}

const send = async (data, idempotencyKey) => {
    // Nodemailer-style attachments use { filename, path }; Resend wants
    // { filename, content }, so read each file into a Buffer.
    const attachments = (data.attachments || []).map(a => ({
        filename: a.filename,
        content: fs.readFileSync(a.path),
    }))

    const payload = {
        from: data.from,
        to: data.to,
        replyTo: data.replyTo,
        subject: data.subject,
        text: data.text,
        attachments,
    }
    if (data.cc?.length) payload.cc = data.cc

    const { data: result, error } = await resend.emails.send(
        payload,
        { idempotencyKey },
    )

    if (error) {
        console.error("Resend send error:", error)
        throw error
    }
    console.log(`Resend accepted order email ${idempotencyKey}, id: ${result?.id}`)
    return result
}

const sendEmail = async (data, _time, id, filename) => {
    console.log(`---- SEND EMAIL FOR ORDER ${id} ----`)

    if (!EMAIL_RE.test(FROM_ADDRESS)) {
        throw permanentError(`EMAIL_FROM is not a valid email address: "${FROM_ADDRESS}"`)
    }

    const { recipients, salesmanEmails, dropped } = buildRecipients(data, file.emails)
    for (const entry of dropped) {
        console.warn(`Dropping invalid ${entry.source} email for order ${id}: "${entry.value}"`)
    }

    if (!recipients.length) {
        throw permanentError(`No valid recipients for order ${id} (${filename})`)
    }

    const company = data.client?.company?.trim() || data.client?.name?.trim() || 'client'
    const senderName = String(data.salesman?.name || 'Esteban Carreras')
        .replace(/[\r\n<>]/g, '')
        .trim() || 'Esteban Carreras'
    const pdfPath = await generatePDF(filename, id)
    const result = await send({
        from: `${senderName} <${FROM_ADDRESS}>`,
        to: recipients[0],
        cc: recipients.slice(1),
        replyTo: salesmanEmails.length ? salesmanEmails : REPLY_TO_FALLBACK,
        subject: `${data.isEstimate ? 'Estimate' : 'Order'} for ${company}`,
        text: `Attached is a PDF of your ${data.isEstimate ? 'estimate' : 'order'}.\nNote: Shipping costs not included.\n\nThis message is automated, please do not reply.`,
        attachments: [{ filename, path: pdfPath }],
    }, `order-email/${id}`)

    console.log(`Email sent for order ${id}`)
    return {
        resendId: result?.id,
        recipients,
        dropped,
    }
}

module.exports = sendEmail
