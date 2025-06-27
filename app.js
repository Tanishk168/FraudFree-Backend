require('dotenv').config(); // this Loads variables from .env
const connectDB = require('./config/db');

const express = require('express');
const cors = require('cors');


const app = express();
// using connectDB just after the app instance
connectDB();

// middlewares- ye request and response ke bich me chalte he like filter
app.use(cors()); // memory refresh-> Allows cross-origin requests from frontend
app.use(express.json());// simple json parsing

// real route for report
const reportRoutes = require('./routes/reportRoutes');
app.use('/api/report', reportRoutes);
// test route for now 
app.use('/',(req,res)=>{
    res.send("i am on  / route dand backend is working")
})



//  listening to server
const Port = process.env.PORT || 5000; // ya to Port number from .env file or default 5000
 app.listen(Port,()=>{
    console.log(`Server is running on port ${Port}`);
 })