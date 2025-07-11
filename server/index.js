require('dotenv').config()
const express = require("express");
const mongoose = require('mongoose');
const cors =  require('cors');
const path =  require('path');
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const PORT = process.env.PORT || 3001

const app = express();

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())

app.use(express.static("public"))
app.use("/", require('./routes/root')) // comment for dev
app.use("/api/auth", require('./routes/auth'))
app.use("/api/users", require('./routes/users'))
app.use("/api/cigars", require("./routes/cigars"))
app.use("/api/clients", require("./routes/clients"))
app.use("/api/photos", require('./routes/photos'))
app.use("/api/orders", require("./routes/orders"))
app.get('/api/ping', (req, res) => res.status(200).end());

// Development
/*
app.use(express.static('../client/build'))
app.all('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
})
*/
// Production
app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
