
// using mongoose to connect to database
// remeber to ask chat gpt to explain all this
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
   await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;