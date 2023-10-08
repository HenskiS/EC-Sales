import express from "express";
import mongoose from 'mongoose';
import cors from 'cors';

import { userRouter } from './routes/users.js'
import { cigarRouter } from "./routes/cigars.js";
import { clientRouter } from "./routes/clients.js";
import { orderRouter } from "./routes/orders.js";


const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", userRouter)
app.use("/cigars", cigarRouter)
app.use("/clients", clientRouter)
app.use("/orders", orderRouter)

mongoose.connect('mongodb://127.0.0.1:27017/test');

app.listen(3001, () => {
    console.log("SERVER RUNNING!");
});
