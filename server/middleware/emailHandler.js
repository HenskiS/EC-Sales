const nodemailer = require("nodemailer")
require('dotenv').config()
const fs = require('fs');
const carbone = require('carbone');


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

const sendEmail = (data) => {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    console.log(data)
    let event = new Date()

    console.log("\n\n\n\n------TIME------")
    let time = event.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).replaceAll(":",".").replaceAll("/","-")
    console.log(time)

    
// ----data format-----
    // data.client
    // data.salesman
    // data.cigars.cigars
    // data.cigars.subtotal
    // data.cigars.tax
    // data.cigars.total

    const data2 = 
    {
        "from": "Esteban Carreras <estebancarrerassales@gmail.com>",
        "to": "henryschreiner@mac.com",
        "subject": "Order Summary",
        "text": "Attached is a PDF of your order.",
        "attachments": [
        {
            "filename": `Order ${time}.pdf`,
            "path": `./orders/Order ${time}.pdf`
        }
        ]
    }
    //console.log('Waiting...');
    carbone.render('./template.odt', data, options, function(err, result){
        if (err) {
          return console.log(err);
        }
        // write the result
        fs.writeFile(`./orders/Order ${time}.pdf`, result, (err) => {
            if (err) console.error(err)
            else {send(data2); console.log("----SENT----");}
        })
      });
    //sleep(20000).then(() => { send(data2); console.log('done waiting!'); });
    //send(data2)
}

module.exports = sendEmail