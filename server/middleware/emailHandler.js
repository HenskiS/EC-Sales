const nodemailer = require("nodemailer")
require('dotenv').config()
const fs = require('fs');
const carbone = require('carbone');
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
    await page.goto(`https://ecsales.work/printorder/${id}`, {
        waitUntil: "load",
    }); // visit the printable version of your page
    await page.waitForSelector("div.order-pdf-header")
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

    const filename = `Order ${time} ${data.salesman.name}.pdf`

    const data2 = 
    {
        "from": `${ data.salesman.name ?? "Esteban Carreras"} <estebancarrerassales@gmail.com>`,
        "to": cc[0], //"henryschreiner@mac.com",
        "cc": cc.slice(1),
        "subject": `Order ${"for " + data.client.company}`,
        "text": "Attached is a PDF of your order.",
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

    /*carbone.render('./template.odt', data, options, function(err, result){
        if (err) {
          return console.log(err);
        }
        // write the result
        fs.writeFile(`./orders/${filename}`, result, (err) => {
            if (err) console.error(err)
            else {send(data2); console.log("-------SENT-------");}
        })
      });*/
    //sleep(20000).then(() => { send(data2); console.log('done waiting!'); });
    //send(data2)
}

module.exports = sendEmail