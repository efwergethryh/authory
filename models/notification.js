const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
    {
        user_id: { type: String, ref: "users" },
        sender: { type: String, ref: "users" },
        paper_id: {
            type: String,
            ref: 'papers'
        },
        post_id: {
            type: String,
            
            ref: 'posts'
        },
        read:{
            type:Boolean,
            default:false
        },
        type: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: { expires: '1h' } 
        }

    },
    
)


const notifications = mongoose.model('notifications', notificationSchema);
module.exports = notifications;