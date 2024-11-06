const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
    {
        user_id:{type:String,ref:"users"},
        sender:{type:String,ref:"users"},
        paper_id:{type: String,
            ref: 'papers', required: true},
        type:{
            type:String,
            required:true
        }
        
    },
    { timestamps: true }    
)


const notifications = mongoose.model('notifications', notificationSchema);
module.exports = notifications;