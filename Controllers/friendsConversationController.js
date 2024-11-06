const { default: mongoose } = require('mongoose');
const FriendsConversation = require('../models/friendConversation');
const message = require('../models/message')
const axios = require('axios');

const sendMessageTofriend = async (req, res) => {

    try {

        const { text } = req.body
        console.log(req.body);
        const id = res.locals.user._id
        const { receiver_id } = req.params
        const { isreply, replyTo } = req.body
        const existing = await FriendsConversation.findOne({ receiver: receiver_id })
        const file = req.file
        let friendConversation;

        if (existing) {

            friendConversation = existing
            const Message = new message({
                text: text,
                conversation_id: friendConversation._id,
                sender: id,
                isreply,
                replyTo,
                fileUrl: file ? file.originalname : null
            });

            await Message.save()
            res.json({ message: 'Message sent successfully', Message, friendConversation });
        }
        else {
            friendConversation = new FriendsConversation(
                {
                    receiver: receiver_id,
                    sender: id
                }
            );


            console.log('conversation id', friendConversation._id);

            friendConversation.save();
            console.log('freind Conversation', friendConversation);
            const Message = new message({
                text: text,
                conversation_id: friendConversation._id,
                sender: id
            })
            Message.save()
            res.json({ message: 'Message sent successfully', Message, friendConversation, userId: id })
        }

    } catch (error) {
        console.log(error);
        res.json({ message: 'An error occured' })

    }
}
const getFriendConversation = async (req, res) => {
    try {
        const { id } = req.params

        const myId = res.locals.user._id
        console.log('user_id', id, 'myId', myId);
        const f_conversation = await FriendsConversation.findOne({ receiver: id })

        res.json({ f_conversation })

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    sendMessageTofriend,

    getFriendConversation
}