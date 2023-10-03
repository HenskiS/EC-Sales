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

router.post("/add", async (req, res) => {
    const { name, phone, address1, address2, city, state, zip } = req.body;
    const client = await ClientModel.findOne({ name });

    if (client) {
        return res.json({ message: "Client already exists!" });
    }

    const newClient = new ClientModel({ name, phone, address1, address2, city, state, zip });
    await newClient.save();

    res.json({ message: "Client Registered Successfully!"});
});

router.post("/cigarblends", async (req, res) => {
    const { brand, name }  = req.body;
    CigarModel.where({ brand })
    .where({ name })
    .distinct("blend")
    .exec()
    .then(cigars => res.json(cigars))
    .catch(err => res.status(404).json({nocigarsfound: "No Cigars Found!"}));
});

router.post("/cigarsizes", async (req, res) => {
    const { brand, name, blend }  = req.body;
    if (blend === "") {
        CigarModel.where({ brand })
        .where({ name })
        .distinct("sizeName")
        .exec()
        .then(cigars => res.json(cigars))
        .catch(err => res.status(404).json({nocigarsfound: "No Cigars Found!"}));
    }
    else {
        CigarModel.where({ brand })
        .where({ name })
        .where({ blend })
        .distinct("sizeName")
        .exec()
        .then(cigars => res.json(cigars))
        .catch(err => res.status(404).json({nocigarsfound: "No Cigars Found!"}));
    }
});

router.post("/cigarprice", async (req, res) => {
    const { brand, name, blend, sizeName }  = req.body;
    if (blend === "") {
        CigarModel.where({ brand })
        .where({ name })
        .where({ sizeName })
        .distinct("priceBox")
        .exec()
        .then(cigars => res.json(cigars))
        .catch(err => res.status(404).json({nocigarsfound: "No Cigars Found!"}));
    }
    else {
        CigarModel.where({ brand })
        .where({ name })
        .where({ blend })
        .where({ sizeName })
        .distinct("priceBox")
        .exec()
        .then(cigars => res.json(cigars))
        .catch(err => res.status(404).json({nocigarsfound: "No Cigars Found!"}));
    }
});


export { router as clientRouter };