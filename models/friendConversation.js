const mongoose = require('mongoose');
const message = require('./message');

const friendConversationSchema = new mongoose.Schema(
    {
        receiver: { type:String, ref: 'users' , required:true},
        sender:{ type: String, ref: 'users', required: true },
    }
)
friendConversationSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        try {
            await message.deleteMany({ conversation_id: doc._id });
            console.log(`Messages deleted for conversation: ${doc._id}`);
        } catch (error) {
            console.error("Error deleting messages:", error);
        }
    }
});
const FriendsConversation = new mongoose.model('FriendsConversation', friendConversationSchema)

module.exports = FriendsConversation