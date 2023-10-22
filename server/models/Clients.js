//import mongoose from "mongoose";
const mongoose =  require("mongoose");


const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
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
    }
    //orders: [String]
    

});

//export const ClientModel = mongoose.model("clients", ClientSchema);
module.exports = mongoose.model("clients", ClientSchema);
