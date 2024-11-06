const mongoose = require('mongoose');
require('dotenv').config()

const MONGODB_URI = process.env.CONNECTION_URI; 

// Connect to MongoDB
function m_connect(){
    mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err)); 
}
module.exports ={
    m_connect
}