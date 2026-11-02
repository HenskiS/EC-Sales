const express = require('express')
const asyncHandler = require('express-async-handler')
const fs = require('fs')
const sharp = require('sharp')
const { Resend } = require('resend')
const User = require('../models/Users')
const verifyJWT = require('../middleware/verifyJWT')
const { EMAIL_RE, parseEmailField } = require('../middleware/emailRecipients')
const {
    CATALOG_TITLE,
    PDF_FILENAME,
    PDF_PATH,
    getCatalogPages,
    resolveCatalogPage,
} = require('../catalog/catalogManifest')

const router = express.Router()
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_ADDRESS = process.env.EMAIL_FROM || 'orders@ecsales.work'
const REPLY_TO_FALLBACK = 'estebancarrerassales@gmail.com'
const DEFAULT_CATALOG_EMAIL_BODY = 'Hello,\n\nAttached is our current Esteban Carreras catalogue.'
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60

const setCatalogCacheHeaders = (res) => {
    res.set('Cache-Control', `public, max-age=${ONE_YEAR_SECONDS}, immutable`)
}

router.get('/', (req, res) => {
    const pages = getCatalogPages()
    const pdfSize = fs.existsSync(PDF_PATH) ? fs.statSync(PDF_PATH).size : null

    res.json({
        title: CATALOG_TITLE,
        pages,
        pdfUrl: '/api/catalog/pdf',
        pdfSize,
    })
})

router.get('/pages/:filename', (req, res) => {
    const pagePath = resolveCatalogPage(req.params.filename)
    if (!pagePath) return res.status(404).json({ message: 'Catalog page not found' })

    setCatalogCacheHeaders(res)
    res.sendFile(pagePath)
})

router.get('/thumbnails/:filename', asyncHandler(async (req, res) => {
    const pagePath = resolveCatalogPage(req.params.filename)
    if (!pagePath) return res.status(404).json({ message: 'Catalog page not found' })

    setCatalogCacheHeaders(res)
    res.type('jpeg')
    const thumbnail = await sharp(pagePath)
        .resize({ width: 260, withoutEnlargement: true })
        .jpeg({ quality: 76, progressive: true })
        .toBuffer()
    res.send(thumbnail)
}))

router.get('/pdf', (req, res) => {
    if (!fs.existsSync(PDF_PATH)) {
        return res.status(503).json({ message: 'The catalog PDF has not been generated' })
    }

    res.set('Cache-Control', 'public, max-age=3600')
    res.download(PDF_PATH, PDF_FILENAME)
})

router.post('/email', verifyJWT, asyncHandler(async (req, res) => {
    const parsed = parseEmailField(req.body.recipientEmail, 'recipient')
    if (parsed.addresses.length !== 1 || parsed.dropped.length) {
        return res.status(400).json({ message: 'Enter one valid recipient email address' })
    }
    if (!fs.existsSync(PDF_PATH)) {
        return res.status(503).json({ message: 'The catalog PDF has not been generated' })
    }
    if (!EMAIL_RE.test(FROM_ADDRESS)) {
        return res.status(500).json({ message: 'EMAIL_FROM is not configured correctly' })
    }

    const user = await User.findOne({ username: req.user }).select('name email').lean()
    const senderName = String(user?.name || 'Esteban Carreras')
        .replace(/[\r\n<>]/g, '')
        .trim() || 'Esteban Carreras'
    const customMessage = String(req.body.customMessage || '').trim().slice(0, 3000)
    const emailBody = customMessage || DEFAULT_CATALOG_EMAIL_BODY
    // Resend accepts attachment content as Base64. Supplying a Buffer makes
    // JSON.stringify expand it into a large numeric array, while a remote URL
    // can fail later during Resend's fetch step after the request is accepted.
    const pdfContent = await fs.promises.readFile(PDF_PATH, 'base64')

    const payload = {
        from: `${senderName} <${FROM_ADDRESS}>`,
        to: parsed.addresses[0],
        replyTo: EMAIL_RE.test(user?.email || '') ? user.email : REPLY_TO_FALLBACK,
        subject: CATALOG_TITLE,
        text: emailBody,
        attachments: [{
            filename: PDF_FILENAME,
            content: pdfContent,
        }],
    }

    const { data, error } = await resend.emails.send(payload)
    if (error) {
        console.error('Catalog email send error:', error)
        const status = Number(error.statusCode || error.status)
        return res.status(status >= 400 && status <= 599 ? status : 502).json({
            message: error.message || 'The email provider rejected the catalogue email',
        })
    }

    console.log(`Resend accepted catalog email, id: ${data?.id}`)

    res.json({
        message: `Catalogue queued for delivery to ${parsed.addresses[0]}`,
        resendId: data?.id,
    })
}))

module.exports = router
