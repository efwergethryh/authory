const GlobalConversation = require('../models/globalConversation');
const bcrypt = require('bcrypt');
const Conversation = require('../models/conversation');
const message = require('../models/message');

const { get_paper } = require('./papersController');
const { default: mongoose } = require('mongoose');



const get_message = async (req, res) => {
    const { id } = req.params; // conversation ID
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;
    const myId = res.locals.user._id
    const filter = req.query.mainfield || ""; // Filter by profession
    
    try {
        const messages = await message.aggregate([
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
                $match: filter !== "All" && filter ? { 
                    $or: [
                        { "senderDetails.main_field": filter }, // Messages from users with the specified profession
                        { sender: new mongoose.Types.ObjectId(myId) } // Include messages sent by the logged-in user
                    ] 
                } : {}
            },
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

const send_message = async (req, res) => {

    try {
        const user = res.locals.user
        const id = user._id
        const { conversation_id } = req.params
        const { isreply, replyTo } = req.body
        const conversation = await Conversation.findById(conversation_id)
        const members = conversation.members
        console.log('body', req.body);
        const file = req.file
        
        const body = req.body
        const newMessage = new message({
            text: body.text,
            sender: id,
            conversation_id,
            isreply,
            replyTo,
            fileUrl:file ? file.originalname : null
        })
        await newMessage.save();

        const paper = await get_paper(conversation.paper_id)

        res.json({ message: 'success',user, newMessage, members, conversation, paper })
    } catch (err) {
        console.log(err);

        if (res) { res.json({ message: 'an error occured' }) } else {
            console.log(err);

        }
    }
}
const get_conversations = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            res.json({ conversations: [] })
        }
        const conversations = await Conversation.find({ paper_id: id }).lean()
        console.log('conversations', conversations);

        const public_conv = await Conversation.findOne({ paper_id: id })
        const public_conv_id = public_conv._id.toString()
        res.json({ conversations, public_conv_id })
    } catch (error) {
        console.log(error);

        res.json(error.message)
    }
}
const add_conversation = async (req, res) => {
    const f = req.file;
    const body = req.body
    const { title, type, members, paper_id } = req.body;
    
    const paper = await get_paper(paper_id)
    // console.log('paper',paper);
    try {

        let conv;
        if (type == 'public') {


            conv = new Conversation(
                {
                    conv_title: "welcome",
                    type: type,
                    conv_pic: 'welcome.png',
                    paper_id: paper_id,
                    members: []
                }
            )

            await conv.save()
            return res.json({ message: 'created successfuly', conv })
        }
        else {
            console.log('private');
            if (!f && !body) {
                return res.json({ message: 'req file or body is null' })
            } else {

                conv = new Conversation(

                    {

                        conv_title: title,
                        conv_pic: f ? f.filename : 'welcome.png',
                        type,
                        paper_id,
                        members
                    }
                )
            }
           await conv.save()


            res.status(200).json({ message: 'conversation created successfully', conv, paper })
        }
    } catch (error) {
        console.log('error', error);
    }
}
const get_conversation = async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            res.json({ conversation: [] })
        }
        const conversation = await Conversation.findById(id)
        console.log('conversation', conversation);

        res.json({ conversation })
    } catch (error) {
        console.log(error);

        res.json(error.message)
    }
}
module.exports = {
    add_conversation, send_message, get_conversations,
    get_message, get_conversation
}

