const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
    {
        conversation_id: { type: mongoose.Schema.Types.ObjectId,
                        ref: 'conversations',required:true},
        sender: { type: String,
                  ref: 'users', required:true },
        text: {
            type:String,
        },
        isreply:{
            type:Boolean,
            default:false
        },
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'messages',
            default: null,
        },
        type:{
            type:String,
            
        },
        fileUrl: {
            type: String,  // Add this field to store the URL or path of the file
            default: null
        },
        readBy: [String]
    },
    { timestamps: true }
)


const message = mongoose.model('Messages', messageSchema);
module.exports = message;