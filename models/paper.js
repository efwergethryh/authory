// models/Paper.js
const mongoose = require('mongoose');

const paperSchema = new mongoose.Schema({
    _id:{
        type:String
    },
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },

    type_of_study: { type: String, required: true },
    title: { type: String, required: true },
    we_need: { type: String, required: true },
    language:{
        type:String,
    },
    tags: {
        type: [String],
        validate: {
            validator: function (tags) {
                return Array.isArray(tags) && new Set(tags).size === tags.length;
            },
            message: 'Tags must be unique.',
        },
    },
    project_branch: { type: String, required: true },
});

// Use singular and capitalized model name 'Paper'
const Paper = mongoose.model('Paper', paperSchema); 
module.exports = Paper;
