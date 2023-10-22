/*import express from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../models/Users.js';
import { CigarModel } from '../models/Cigars.js'*/
const express =  require("express");
const jwt =  require('jsonwebtoken');
const bcrypt =  require('bcrypt');
const UserModel  =  require('../models/Users.js');
const CigarModel  =  require('../models/Cigars.js');
const verifyJWT = require('../middleware/verifyJWT');

const router = express.Router();

router.use(verifyJWT)
// GET cigars/
// get all cigars
router.get("/", async (req, res) => {
    CigarModel.where({brand: "Esteban Carreras"})
    .distinct("name")
    .exec()
    .then(cigars => res.json(cigars))
    .catch(err => res.status(404).json({nocigarsfound: "No Cigars Found!"}));
});

router.get("/cigarbrands", async (req, res) => {
    CigarModel
    .distinct("brand")
    .exec()
    .then(brands => res.json(brands))
    .catch(err => res.status(404).json({nobrandsfound: "No Brands Found!"}));
});

router.post("/cigarnames", async (req, res) => {
    const { brand }  = req.body;
    CigarModel.where({ brand })
    .distinct("name")
    .exec()
    .then(cigars => res.json(cigars))
    .catch(err => res.status(404).json({nocigarsfound: "No Cigars Found!"}));
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


//export { router as cigarRouter };
module.exports = router