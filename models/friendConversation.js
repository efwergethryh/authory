const mongoose = require('mongoose');

const friendConversationSchema = new mongoose.Schema(
    {
        receiver: { type:String, ref: 'users' , required:true},
        sender:{ type: String, ref: 'users', required: true },
    }
)

const FriendsConversation = new mongoose.model('FriendsConversation', friendConversationSchema)

module.exports = FriendsConversation