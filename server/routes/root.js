/*import express from "express"
const router = express.Router()
import path from 'path';
import { fileURLToPath } from "url";*/
const express =  require("express");
const router = express.Router();
const path =  require('path');
const { fileURLToPath } =  require("url");

/*const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)*/

router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'))
})

module.exports = router