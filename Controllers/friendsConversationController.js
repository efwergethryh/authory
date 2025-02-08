const { default: mongoose } = require('mongoose');
const FriendsConversation = require('../models/friendConversation');
const message = require('../models/message')
const axios = require('axios');

const sendMessageTofriend = async (req, res) => {

    try {
        const { text } = req.body
        const id = res.locals.user._id
        const { receiver_id } = req.params
        const { isreply, replyTo } = req.body
        const existing = await FriendsConversation.findOne({ receiver: receiver_id })
        const file = req.file
        let friendConversation;

        if (existing) {
            console.log('freind Conversation', existing);

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
const getFriendConversations = async (req, res) => {
    try {
        const myId = res.locals.user._id;
    
    
        const f_conversations = await FriendsConversation.aggregate([
           
            {
                $lookup: {
                    from: 'users', 
                    localField: 'receiver',
                    foreignField: '_id',
                    as: 'receiverInfo'
                }
            },
            {
                $lookup: {
                    from: 'users', 
                    localField: 'sender',
                    foreignField: '_id',
                    as: 'senderInfo'
                }
            },
            {
                $match: {
                    $or: [
                        { 'sender': '6760' },  // userId is the _id of the user you're querying for
                        { 'receiver': '6760' }
                    ]
                }
            },
            
            {
                $addFields: {
                    receiverInfo: {
                        $map: {
                            input: '$receiverInfo',
                            as: 'receiver',
                            in: {
                                _id: '$$receiver._id',
                                name: '$$receiver.name',
                                email: '$$receiver.email',
                                profile_picture: '$$receiver.profile_picture'
                            }
                        }
                    },
                    senderInfo: {
                        $map: {
                            input: '$senderInfo',
                            as: 'sender',
                            in: {
                                _id: '$$sender._id',
                                name: '$$sender.name',
                                email: '$$sender.email',
                                profile_picture: '$$sender.profile_picture'
                            }
                        }
                    }
                }
            },
            
            {
                $project: {
                    _id: 1,
                    receiverInfo: 1,
                    senderInfo: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]);
    
        console.log('friend conversations',f_conversations);
        
        res.json({ f_conversations });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    
    

}
module.exports = {
    sendMessageTofriend,
    getFriendConversations,
    getFriendConversation
}