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
    },

    isEstimate: {
        type: Boolean,
        default: false
    },

    // The extra recipients entered on the order form must be persisted so a
    // queued email can be reconstructed after a process or server restart.
    emailRecipients: {
        type: [String],
        default: undefined
    },

    // Durable outbox state. Only newly-created orders receive this object, so
    // deploying the worker cannot accidentally email historical orders.
    emailDelivery: {
        status: {
            type: String,
            enum: ['pending', 'processing', 'sent', 'failed']
        },
        attempts: {
            type: Number,
            default: 0
        },
        nextAttemptAt: Date,
        lastAttemptAt: Date,
        lockedAt: Date,
        lockId: String,
        sentAt: Date,
        resendId: String,
        recipients: [String],
        warnings: [String],
        lastError: String
    }

});

OrderSchema.index({
    'emailDelivery.status': 1,
    'emailDelivery.nextAttemptAt': 1,
    'emailDelivery.lockedAt': 1
})

//export const OrderModel = mongoose.model("orders", OrderSchema);
module.exports = mongoose.model("orders", OrderSchema);
