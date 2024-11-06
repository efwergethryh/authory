// models/RefreshToken.js
const mongoose = require('mongoose');

// Define the RefreshToken schema
const RefreshTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'users', // Referencing the User model
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Export the RefreshToken model
const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
module.exports = RefreshToken;
