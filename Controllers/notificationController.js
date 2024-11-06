const notifications = require('../models/notification');
const notification = require('../models/notification');
const Paper = require('../models/paper');
const User = require('../models/User');
const { get_paper } = require('./papersController');

const new_notification = async (req, res) => {
    try {
        const user = res.locals.user
        const { type, paper_id } = req.body
        
        const { id } = req.params
        const Notification = new notification({
            type,
            user_id: id,
            sender: user._id,
            paper_id:paper_id || null
        })
        Notification.save()
        res.json({ message: "Notification sent", user  })
    } catch (error) {
        console.log(error);

    }
}
const notify_all = async(req, res) => {
    const me = res.locals.user
    const limit = parseInt(req.query.limit) || 10; // Number of users per batch
    const skip = parseInt(req.query.skip) || 0;
    const users = await User.find().skip(skip).limit(limit);
    console.log('USERS',users);
    const {type} = req.body
    users.forEach(user=>{

        const Notification = new notifications({
            sender:me._id,
            user_id:user._id,
            type
        })
        Notification.save()

    })
    res.json({message:"users notified"});
}
const notifyMembersOnly = (req,res)=>{
    const {members, type} = req.body
    console.log('paperId',paper_id);
    
    members.forEach(member=>{

        const Notification = new notifications({
            sender:me._id,
            user_id:member._id,
            type,
            
        })
        Notification.save()

    })
}
const get_notifications = async (req, res) => {
    try {
        const user = res.locals.user

        const Notifications = await notification.find({ user_id: user._id })

        res.json({ Notifications })
    } catch (error) {
        console.log(error);

    }

}
module.exports = {
    new_notification, get_notifications, notify_all,notifyMembersOnly
}