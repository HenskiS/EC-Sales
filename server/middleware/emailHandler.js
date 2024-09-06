const nodemailer = require("nodemailer")
require('dotenv').config()
const fs = require('fs');
const puppeteer = require("puppeteer");

const fileName = './config/tax.json';
const file = require('../config/tax.json');

const config = {
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "estebancarrerassales@gmail.com",
        pass: process.env.EMAIL_PASS
    }
}
var options = {
    convertTo : 'pdf'
};

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

const send = (data) => {
    const transporter = nodemailer.createTransport(config)
    transporter.sendMail(data, (err, info) => {
        if (err) {
            console.log(err)
        } else {
            return info.response
        }
    })
}

const sendEmail = async (data, time, id) => {

    console.log(data)

    console.log("----SEND EMAIL----")
    
    let cc = file.emails?.length >= 1 ? file.emails.concat() : []
    if (data.client.email && data.client.email !== "") {
        cc.push(data.client.email)
    }
    if (data.salesman.email && data.salesman.email !== "") {
        cc.push(data.salesman.email)
    }
    if (data.emails && data.emails.length > 0) {
        cc.push.apply(cc, data.emails)
    }

    if (!data.client.company || data.client.company === "") data.client.company = data.client.name

    const filename = `Order ${time} ${data.salesman.name} ${data.client.company}.pdf`

    const data2 = 
    {
        "from": `${ data.salesman.name ?? "Esteban Carreras"} <estebancarrerassales@gmail.com>`,
        "to": cc[0], //"henryschreiner@mac.com",
        "cc": cc.slice(1),
        "subject": `Order ${"for " + data.client.company}`,
        "text": "Attached is a PDF of your order.\n\nThis message is automated, please do not reply.",
        "attachments": [
        {
            "filename": filename,
            "path": `./orders/${filename}`
        }
        ]
    }
    const pdf = await generatePDF(filename, id)
    if (pdf) {
        send(data2);
        console.log("-------SENT-------");
    }
}

module.exports = sendEmail