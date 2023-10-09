import express from "express";
import { ClientModel } from '../models/Clients.js'

const router = express.Router();

// GET cigars/
// get all cigars
router.get("/", async (req, res) => {
    ClientModel//.where({brand: "Esteban Carreras"})
    //.distinct("name")
    .exec()
    .then(clients => res.json(clients))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});

router.get("/clientnames", async (req, res) => {
    //const { brand }  = req.body;
    ClientModel//.where({ brand })
    //.distinct("name")
    .find()
    .select("name _id")
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

router.post("/updateclientbyid", async (req, res) => {
    const client = req.body.editClient;
    const id = client._id;
    ClientModel.findByIdAndUpdate({_id: id}, 
        {
            name: client.name,
            phone: client.phone,
            address1: client.address1,
            address2: client.address2,
            city: client.city,
            state: client.state,
            zip: client.zip
        }, {new: true}) // new option returns modified doc rather than original
    .then(client => res.json(client))
    .catch(err => res.status(404).json({noclientsfound: "No Clients Found!"}));
});

router.post("/add", async (req, res) => {
    const client = req.body.editClient;
    const id = client._id;

    const c = await ClientModel.findOne({ name: client.name });
    if (c) {
        return res.json({ exists: "Client already exists!" });
    }

    const newClient = new ClientModel( 
        {
            name: client.name,
            phone: client.phone,
            address1: client.address1,
            address2: client.address2,
            city: client.city,
            state: client.state,
            zip: client.zip
        })
    await newClient.save();

    res.json({ success: "Client Registered Successfully!"})
});



export { router as clientRouter };