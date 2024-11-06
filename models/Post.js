const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title:{type:String},
    post_image:{type:[String]},
    content:{type:String},
    
    tags: {
        type: [String],
        validate: {
            validator: function (tags) {
                return Array.isArray(tags) && new Set(tags).size === tags.length;
            },
            message: 'Tags must be unique.',
        },
    },
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },

})
const Post  = new mongoose.model('Post',PostSchema)

module.exports = Post