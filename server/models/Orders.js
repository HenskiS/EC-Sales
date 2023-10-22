//import mongoose from "mongoose";
const mongoose =  require("mongoose");


const OrderSchema = new mongoose.Schema({
    client: {
        type: {
            _id: String,
            name: String,
            phone: String,
            address1: String,
            address2: {
                type: String,
                default: ""
            },
            city: String,
            state: String,
            zip: String
        },
        required: true
    },

    salesman: {
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            name: String
        },
        required: true
    },

    cigars: {
        type: {
            cigars: [String],
            subtotal: Number,
            total: Number
        },
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }

});

//export const OrderModel = mongoose.model("orders", OrderSchema);
module.exports = mongoose.model("orders", OrderSchema);
