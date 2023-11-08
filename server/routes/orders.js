/*import express from "express";
import { OrderModel } from '../models/Orders.js'*/
const express =  require("express");
const OrderModel =  require('../models/Orders.js');
const verifyJWT = require('../middleware/verifyJWT');

const router = express.Router();
router.use(verifyJWT)

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

    const newOrder = new OrderModel( 
        {
            client: req.body.client,
            salesman: req.body.salesman,
            cigars: req.body.cigars,
            date: req.body.date
        })
    await newOrder.save();

    res.json({ success: "Order Added Successfully!"})
});


//export { router as orderRouter };
module.exports = router