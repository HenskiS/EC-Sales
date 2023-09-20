import mongoose from "mongoose";

const CigarSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    blend: {
        type: String,
        required: false
    },
    sizeName: {
        type: String,
        required: true
    },
    quantityBox: {
        type: Number,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    priceEach: {
        type: Number,
        required: true
    },
    priceBox: {
        type: Number,
        required: true
    }

});

export const CigarModel = mongoose.model("cigars", CigarSchema);
