const mongoose = require('mongoose')

const requestSchema = new mongoose.Schema({
    sender: {
        type: String,
        ref: 'users', // Referencing the User model
        required: true
    },
    receiver: {
        type: String,
        ref: 'users', // Referencing the User model
        required: true
    },
    paper_id: {
        type:String,
        ref: 'paper', // Referencing the User model
        required: true
    },

},
    { timestamps: true }
)
const Request = mongoose.model('Request',requestSchema)

module.exports = Request