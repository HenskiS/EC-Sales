/*import express from "express";
import { ClientModel } from '../models/Clients.js'*/
const express =  require("express");
const ClientModel =  require('../models/Clients.js');
const verifyJWT = require('../middleware/verifyJWT');
const cors =  require('cors');

const router = express.Router();
router.use(verifyJWT)
// GET cigars/
// get all cigars
/*router.get("/", async (req, res) => {
    ClientModel//.where({brand: "Esteban Carreras"})
    //.distinct("name")
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});*/

router.get("/", async (req, res) => {
    //const { brand }  = req.body;
    ClientModel//.where({ brand })
    //.distinct("name")
    .find()
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});
router.get("/clientnames", async (req, res) => {
    //const { brand }  = req.body;
    ClientModel.where({ isInternational: false })
    //.distinct("name")
    .find()
    .select("company city state name email _id")
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});
router.get("/clientnames/intl", async (req, res) => {
    //const { brand }  = req.body;
    ClientModel.where({ isInternational: true })
    //.distinct("name")
    .find()
    .select("company city state name _id country")
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});

router.post("/delete", async (req, res) => {
    //const { brand }  = req.body;
    ClientModel//.where({ brand })
    //.distinct("name")
    .findOneAndDelete({_id: req.body.id})
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});

router.post("/getclientbyid", async (req, res) => {
    //const { brand }  = req.body;
    const id = req.body.id;
    ClientModel//.where({ brand })
    //.distinct("name")
    .findOne({ _id: id })
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});
router.post("/getdiscountbyid", async (req, res) => {
    //const { brand }  = req.body;
    const id = req.body.id;
    console.log("\n\n\n\n\n\n")
    console.log("id: " + req.body.id)
    ClientModel//.where({ brand })
    //.distinct("name")
    .findOne({ _id: id })
    .select("corediscount")
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});

router.post("/updateclientbyid", async (req, res) => {
    const client = req.body.editClient;
    const id = client._id;
    ClientModel.findByIdAndUpdate({_id: id}, 
        {
            company: client.company,
            name: client.name,
            contact: client.contact,
            email: client.email,
            phone: client.phone,
            ext: client.ext,
            mobile: client.mobile,
            title: client.title,
            address1: client.address1,
            address2: client.address2,
            city: client.city,
            state: client.state,
            zip: client.zip,
            corediscount: client.corediscount
        }, {new: true}) // new option returns modified doc rather than original
    .then(client => res.json(client))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});

router.post("/add", async (req, res) => {
    const client = req.body.editClient;
    const id = client._id;

    const c = await ClientModel.findOne({ company: client.company });
    if (c) {
        return res.json({ exists: "Client already exists!" });
    }

    const newClient = new ClientModel( 
        {
            company: client.company,
            name: client.name,
            contact: client.contact,
            email: client.email,
            phone: client.phone,
            ext: client.ext,
            mobile: client.mobile,
            title: client.title,
            address1: client.address1,
            address2: client.address2,
            city: client.city,
            state: client.state,
            zip: client.zip,
            country: client.country,
            corediscount: client.corediscount,
            isInternational: client.isInternational
        })
    await newClient.save();

    res.json({ success: "Client Registered Successfully!"})
});


module.exports= router