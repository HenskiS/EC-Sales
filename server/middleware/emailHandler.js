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
    console.log(data)

    carbone.render('./template1.odt', data, function(err, result){
        if (err) {
          return console.log(err);
        }
        // write the result
        fs.writeFileSync('result2.odt', result);
      });
// ----data format-----
    // data.client
    // data.salesman
    // data.cigars.cigars
    // data.cigars.subtotal
    // data.cigars.tax
    // data.cigars.total
    const data2 = {
        "from": "Esteban Carreras <estebancarrerassales@gmail.com>",
        "to": "henryschreiner@mac.com",
        "subject": "Why? Because I Can!",
        "text": "Ahoy-hoy"
    }
    //send(data2)
}

module.exports = sendEmail