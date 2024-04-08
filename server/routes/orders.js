/*import express from "express";
import { OrderModel } from '../models/Orders.js'*/
const sendEmail = require("../middleware/emailHandler");
const express =  require("express");
const OrderModel =  require('../models/Orders.js');
const verifyJWT = require('../middleware/verifyJWT');
const path = require('path');

const router = express.Router();
router.use(verifyJWT)

const fs = require('fs');
const fileName = './config/tax.json';
const file = require('../config/tax.json');

router.get("/catax", async (req, res) => {
    res.json(file.tax)
})

router.post("/catax", async (req, res) => {
    file.tax = req.body.tax;
    fs.writeFileSync(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) res.status(404).json(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + fileName);
        res.json({success: "Success!"}) 
    });
    res.json({success: "Success!"}) 
})

router.get("/emails", async (req, res) => {
    res.json(file.emails)
})

router.post("/emails", async (req, res) => {
    file.emails = req.body.emails;
    fs.writeFileSync(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) res.status(404).json(err);
        console.log(JSON.stringify(file));
        console.log('writing to ' + fileName);
        res.json({success: "Success!"}) 
    });
    res.json({success: "Success!"}) 
})

router.get("/ordersminuscigars", async (req, res) => {
    // Get all users from MongoDB
    const orders = await OrderModel.find().select('-cigars.cigars').lean()

    // If no users 
    if (!orders?.length) {
        return res.status(400).json({ message: 'No orders found' })
    }

    res.json(orders)
})

router.post("/getordersbyclientid", async (req, res) => {
    const id = req.body.id;
    OrderModel
    .find({ "client._id": id })
    .exec()
    .then(orders => res.json(orders.sort((a,b) => {
        if (a.date < b.date)
            return -1;
        if (a.date > b.date)
            return 1;
        return 0;
    }).reverse()))
    .catch(err => res.status(404).json({noclientsfound: "No Orders Found!"}));
});

router.post("/getordersbysalesid", async (req, res) => {
    const id = req.body.id;
    OrderModel
    .find({ "salesman._id": id })
    .exec()
    .then(orders => res.json(orders.sort((a,b) => {
        if (a.date < b.date)
            return -1;
        if (a.date > b.date)
            return 1;
        return 0;
    }).reverse()))
    .catch(err => res.status(404).json({noclientsfound: "No Orders Found!"}));
});

router.post("/salesmantotal", async (req, res) => {
    const id = req.body.id;
    OrderModel
    .find({ "salesman._id": id })
    .exec()
    .then(orders => res.json(orders.map(i=>i.cigars.total).reduce((a,b)=>a+b)))
    //.catch(err => res.status(404).json({noclientsfound: "No Orders Found!"}));
    .catch(err => res.json(0))
});

router.post("/add", async (req, res) => {
    // if the order is submitted after 4pm, the date may be the next day
    let event = new Date()
    let time = event.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }).replaceAll(":",".").replaceAll("/","-")
    let filename = `Order ${time} ${req.body.salesman.name}.pdf`
    console.log("filename: " + filename)
    sendEmail(req.body, time)
    
    const newOrder = new OrderModel( 
        {
            client: req.body.client,
            salesman: req.body.salesman,
            cigars: req.body.cigars,
            cigarData: req.body.cigarData,
            filename: filename,
            date: req.body.date
        })
    await newOrder.save();

    res.json({ success: "Order Added Successfully!"})
});

router.get('/pdfs/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join('./orders/', filename);
  
    fs.access(filePath, fs.constants.R_OK, err => {
      if (err) {
        return res.status(404).json({ error: 'PDF not found.' });
      }
  
      // Stream the file to the client
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });
  });


//export { router as orderRouter };
module.exports = router