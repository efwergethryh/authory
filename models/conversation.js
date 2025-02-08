const mongoose = require('mongoose');
const message = require('./message');

const conversationSchema = new mongoose.Schema({
    members: {
        type: [String],  // Array of ObjectId
        ref: 'users',  // Referencing 'users' collection
        required: true  // This field is mandatory
    },
    receiver: { type:String, ref: 'users'},
    sender:{ type: String, ref: 'users'},
    conv_pic: {
        type: String,
        default: null
    },
    conv_title: {
        type: String,
    },
    type: {
        type: String, required: true
    },
    paper_id: { type: String, ref: 'paper' }
});
conversationSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        try {
            await message.deleteMany({ conversation_id: doc._id });
            console.log(`Messages deleted for conversation: ${doc._id}`);
        } catch (error) {
            console.error("Error deleting messages:", error);
        }
    }
});    
conversationSchema.pre('remove', async function (next) {
    try {
        await message.deleteMany({ conversation: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

const Conversation = mongoose.model('conversations', conversationSchema);

module.exports = Conversation;
