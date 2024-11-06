const mongoose = require('mongoose');

const globalConversationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: {
      type:String  
    }
});

const GlobalConversation = mongoose.model('GlobalConversation', globalConversationSchema);

module.exports = GlobalConversation;
