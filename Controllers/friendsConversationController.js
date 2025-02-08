const FriendsConversation = require('../models/friendConversation');
const message = require('../models/message')
const axios = require('axios');
const Conversation = require('../models/conversation');
const mongoose = require('mongoose')

const sendMessageTofriend = async (req, res) => {

    try {
        const { text } = req.body
        const id = res.locals.user._id
        const { receiver_id } = req.params
        console.log('rec id', receiver_id);

        const { isreply, replyTo } = req.body
        const existing = await Conversation.findOne({
            type: "friend",
            $or: [{

                sender: receiver_id, receiver: id
            },
            {receiver: receiver_id, sender: id }
            ]
        })
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

            friendConversation = new Conversation(
                {
                    receiver: receiver_id,
                    sender: id,
                    type: "friend"
                }
            );
            console.log('new freind Conversation', friendConversation);



            friendConversation.save();
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

        console.log();

        const f_conversations = await Conversation.aggregate([

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
                    type: "friend",
                    $or: [
                        { 'sender': myId },  // userId is the _id of the user you're querying for
                        { 'receiver': myId }
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
        // const f_conversations = await FriendsConversation.aggregate([
        //     {
        //         $lookup: {
        //             from: 'users',
        //             localField: 'receiver',
        //             foreignField: '_id',
        //             as: 'receiverInfo'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'users',
        //             localField: 'sender',
        //             foreignField: '_id',
        //             as: 'senderInfo'
        //         }
        //     },
        //     {
        //         $match: {
        //                         $or: [
        //                             { 'sender': myId },  // userId is the _id of the user you're querying for
        //                             { 'receiver': myId }
        //                         ]
        //                     }
        //     },
        //     {
        //         $addFields: {
        //             receiverInfo: {
        //                 $arrayElemAt: ['$receiverInfo', 0] // Extract the first element from the array
        //             },
        //             senderInfo: {
        //                 $arrayElemAt: ['$senderInfo', 0] // Extract the first element from the array
        //             }
        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             receiverInfo: {
        //                 _id: 1,
        //                 name: 1,
        //                 email: 1,
        //                 profile_picture: 1
        //             },
        //             senderInfo: {
        //                 _id: 1,
        //                 name: 1,
        //                 email: 1,
        //                 profile_picture: 1
        //             },
        //             createdAt: 1,
        //             updatedAt: 1
        //         }
        //     }
        // ]);
        console.log('friend conversations', f_conversations);

        res.json({ f_conversations });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }



}
const get_message = async (req, res) => {
    const { conversation_id } = req.params; // conversation ID
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;

    const myId = res.locals.user._id
    try {
        const messages = await message.aggregate([
           

            {
                $match: {
                    conversation_id: new mongoose.Types.ObjectId(conversation_id),
                    
                  },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "senderDetails",
                },
            },
            { $unwind: "$senderDetails" },
            {
                $project: {
                    text: 1,
                    conversation_id: 1,
                    createdAt: 1,
                    replyTo: 1,
                    fileUrl: 1,
                    isreply: 1,

                    "senderDetails.name": 1,
                    "senderDetails.email": 1,
                    "senderDetails.profession": 1,
                    "senderDetails._id": 1,
                    "senderDetails.country": 1,
                    "senderDetails.profile_picture": 1,

                },
            },
            { $sort: { createdAt: -1 } }, // Sort by date
            { $skip: skip },
            { $limit: limit },
        ]);
        

        return res.json({ messages });
    } catch (error) {
        console.error("Error in get_message controller:", error);
        return res.status(500).json({ message: "An error occurred" });
    }
};
module.exports = {
    sendMessageTofriend,
    getFriendConversations,
    getFriendConversation, get_message
}