//import mongoose from "mongoose";
const mongoose =  require("mongoose");


const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    company: {
        type: String,
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    ext: {
        type: String
    },
    mobile: {
        type: String
    },
    contact: {
        type: String
    },
    title: {
        type: String
    },
    website: {
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
