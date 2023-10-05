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

/*
https://www.codingthesmartway.com/the-mern-stack-tutorial-building-a-react-crud-application-from-start-to-finish-part-2/
todoRoutes.route('/add').post(function(req, res) {
    let todo = new Todo(req.body);
    todo.save()
        .then(todo => {
            res.status(200).json({'todo': 'todo added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new todo failed');
        });
});
*/

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