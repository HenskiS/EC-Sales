require('dotenv').config()
const fs = require("fs");
const puppeteer = require("puppeteer");
const { Resend } = require("resend");
const file = require('../config/tax.json');

// DigitalOcean blocks outbound SMTP (25/465/587), so we send over Resend's
// HTTPS API (port 443) instead. Sender must be on a Resend-verified domain.
const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_ADDRESS = process.env.EMAIL_FROM || "orders@ecsales.work"
// Where replies go when a salesman has no email on file.
const REPLY_TO_FALLBACK = "estebancarrerassales@gmail.com"

const generatePDF = async (filename, id) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
      }); 
    const page = await browser.newPage(); // open a page in the browser
    //await page.goto(`http://localhost:3000/printorder/${id}`, {
    await page.goto(`https://ecsales.work/printorder/${id}`, {
        waitUntil: "load",
    }); // visit the printable version of your page
    await page.waitForSelector("h1.order-pdf-header") // wait until page gets order data
    const pdf = await page.pdf({ format: "a4", path: `./orders/${filename}` }); // generate the PDF 🎉
    await browser.close();
    return pdf
}

const send = async (data) => {
    // Nodemailer-style attachments use { filename, path }; Resend wants
    // { filename, content }, so read each file into a Buffer.
    const attachments = (data.attachments || []).map(a => ({
        filename: a.filename,
        content: fs.readFileSync(a.path),
    }))

    const { data: result, error } = await resend.emails.send({
        from: data.from,
        to: data.to,
        cc: data.cc,
        replyTo: data.replyTo,
        subject: data.subject,
        text: data.text,
        attachments,
    })

    if (error) {
        console.error("Resend send error:", error)
        throw error
    }
    console.log("Resend accepted, id:", result?.id)
    return result
}

const sendEmail = async (data, time, id, filename) => {

    console.log(data)

    console.log("----SEND EMAIL----")
    
    let cc = file.emails?.length >= 1 ? file.emails.concat() : []
    if (data.isEstimate) {
        cc = [];
    }
    if (data.client.email && data.client.email !== "") {
        cc.push(data.client.email)
    }
    if (data.salesman.email && data.salesman.email !== "") {
        cc.push(...data.salesman.email.split(';').map(e => e.trim()).filter(e => e))
    }
    if (data.emails && data.emails.length > 0) {
        cc.push.apply(cc, data.emails)
    }

    if (!data.client.company || data.client.company === "") data.client.company = data.client.name

    if (!cc.length) {
        console.error(`No recipients for order ${id} (${filename}) — email NOT sent`)
        return
    }

    const salesmanEmails = (data.salesman.email || "").split(';').map(e => e.trim()).filter(e => e)

    const data2 =
    {
        "from": `${ data.salesman.name ?? "Esteban Carreras"} <${FROM_ADDRESS}>`,
        "to": cc[0],
        "cc": cc.slice(1),
        "replyTo": salesmanEmails.length ? salesmanEmails : REPLY_TO_FALLBACK,
        "subject": `${data.isEstimate? "Estimate" : "Order"} ${"for " + data.client.company}`,
        "text": `Attached is a PDF of your ${data.isEstimate? "estimate" : "order"}.\nNote: Shipping costs not included.\n\nThis message is automated, please do not reply.`,
        "attachments": [
        {
            "filename": filename,
            "path": `./orders/${filename}`
        }
        ]
    }
    const pdf = await generatePDF(filename, id)
    if (pdf) {
        await send(data2);
        console.log("-------SENT-------");
    } else {
        console.error(`generatePDF returned no pdf for order ${id} (${filename}) — email NOT sent`);
    }
}

module.exports = sendEmail