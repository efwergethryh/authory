const GlobalConversation = require('../models/globalConversation');
const bcrypt = require('bcrypt');
const Conversation = require('../models/conversation');
const message = require('../models/message');

const { get_paper } = require('./papersController');

const get_message = async (req, res) => {
    const { id } = req.params

    const userId = res.locals.user._id
    let messages;
    try {
        if (!id) {

            res.json({ messages })
        }
        messages = await message.find({ conversation_id: id })
        const public_conv = await Conversation.findOne({ paper_id: id, type: 'public' })

        if (public_conv) {
            const public_conv_id = public_conv._id.toString()
            res.json({ messages, userId, public_conv_id })
        }
        else {
            res.json({ messages, userId, })
        }

    }
    catch (error) {
        console.log(error);

        res.json({ message: "An error occured" })
    }
}
const send_message = async (req, res) => {

    try {
        const id = res.locals.user._id
        const { conversation_id } = req.params
        const { isreply, replyTo } = req.body
        const conversation = await Conversation.findById(conversation_id)
        const members = conversation.members
        console.log('body',req.body);
        
        const body = req.body
        const newMessage = new message({
            text: body.text,
            sender: id,
            conversation_id,
            isreply,
            replyTo 
        })
        newMessage.save();

        const paper = await get_paper(conversation.paper_id)

        res.json({ message: 'success', newMessage, members, conversation, paper })
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

        const public_conv = await Conversation.findOne({ paper_id: id})
        const public_conv_id = public_conv._id.toString()
        res.json({ conversations, public_conv_id })
    } catch (error) {
        console.log(error);
        
        res.json(error.message)
    }
}
const add_conversation = async(req, res) => {
    const f = req.file;
    const body = req.body
    const { title, type, members, paper_id } = req.body; 
    const paper = get_paper(paper_id, req = null, res = null)
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
            conv.save()


            res.json({ message: 'conversation created successfully', conv, paper })
        }
    } catch (error) {
        console.log('error',error);
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

        res.json({ conversation})
    } catch (error) {
        console.log(error);
        
        res.json(error.message)
    }
}
module.exports = {
    add_conversation, send_message, get_conversations,
    get_message,get_conversation
}

