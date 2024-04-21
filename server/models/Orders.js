//import mongoose from "mongoose";
const mongoose =  require("mongoose");


const OrderSchema = new mongoose.Schema({
    client: {
        type: {},
        required: true
    },

    salesman: {
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            email: String
        },
        required: true
    },

    cigars: {
        type: {},
        required: true
    },

    cigarData: {
        type: Array,
        required: false
    },

    date: {
        type: Date,
        default: Date.now
    },

    filename: {
        type: String
    },

    notes: {
        type: String
    }

});

//export const OrderModel = mongoose.model("orders", OrderSchema);
module.exports = mongoose.model("orders", OrderSchema);
