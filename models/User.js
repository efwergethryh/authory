// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema
const UserSchema = new mongoose.Schema({
    _id:{
        type:String,
    },
    name:{
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    university:{
        type: String,
    },
    profession:{
        type: String,
        rquired:true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address'] // Basic email validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    looking_for: {
        type: String
    },
    country: {
        type: String
    },
    type_of_study: {
        type: String
    },
    project_branch: {
        type: String
    },
    project_title: {
        type: String
    },
    scientific_interest: {
        type: String
    },
    profile_picture: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user_type: {
        type: Number,
        required: true
    },
    banned:{
        type:Boolean,
        default:false
    },
    googleId: {
        type: String,  // Store the Google ID as a string
        
        unique: true    // Make sure it's unique to prevent duplicate users
    },
    facebookId: {
        type: String,  // Store the Google ID as a strin
        unique: true    // Make sure it's unique to prevent duplicate users
    },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
