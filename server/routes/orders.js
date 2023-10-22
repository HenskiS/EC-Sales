/*import express from "express";
import { OrderModel } from '../models/Orders.js'*/
const express =  require("express");
const OrderModel =  require('../models/Orders.js');
const verifyJWT = require('../middleware/verifyJWT');

const router = express.Router();
router.use(verifyJWT)

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