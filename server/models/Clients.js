//import mongoose from "mongoose";
const mongoose =  require("mongoose");


const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    address1: {
        type: String
    },
    address2: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zip: {
        type: String
    },
    corediscount: {
        type: Number,
        default: 0
    }
    //orders: [String]
    

});

//export const ClientModel = mongoose.model("clients", ClientSchema);
module.exports = mongoose.model("clients", ClientSchema);
