//import mongoose from "mongoose";
const mongoose =  require("mongoose");


const CigarSchema = new mongoose.Schema({
    brandAndName: {
        type: String,
    },
    blend: {
        type: String,
    },
    sizeName: {
        type: String,
    },
    quantityBox: {
        type: Number,
    },
    size: {
        type: String,
    },
    priceEach: {
        type: Number,
    },
    priceBox: {
        type: Number,
    },
    internationalOnly: {
        type: Boolean,
    },
    isCalifornia: {
        type: Boolean,
        default: true
    }

});

//export const CigarModel = mongoose.model("cigars", CigarSchema);
module.exports = mongoose.model("cigars", CigarSchema);
