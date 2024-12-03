const notifications = require('../models/notification');
const notification = require('../models/notification');
const Paper = require('../models/paper');
const User = require('../models/User');
const { get_paper } = require('./papersController');

const new_notification = async (req, res) => {
    try {
        const user = res.locals.user
        const { type, paper_id, post_id } = req.body

        const { id } = req.params
        const Notification = new notification({
            type,
            user_id: id,
            sender: user._id,
            paper_id: paper_id || null,
            post_id: post_id || null
        })
        Notification.save()
        res.json({ message: "Notification sent", user })
    } catch (error) {
        console.log(error);

    }
}
const notify_all = async (req, res) => {
    const me = res.locals.user
    const limit = parseInt(req.query.limit) || 10; // Number of users per batch
    const skip = parseInt(req.query.skip) || 0;
    const users = await User.find().skip(skip).limit(limit);

    const { type, post_id } = req.body
    users.forEach(user => {

        const Notification = new notifications({
            sender: me._id,
            user_id: user._id,
            type,
            post_id: post_id || null
        })
        Notification.save()

    })
    res.json({ message: "users notified" });
}
const notifyMembersOnly = (req, res) => {
    const { members, type } = req.body
    console.log('paperId', paper_id);

    members.forEach(member => {

        const Notification = new notifications({
            sender: me._id,
            user_id: member._id,
            type,

        })
        Notification.save()

    })
}
const get_notifications = async (req, res) => {
    try {
        const user = res.locals.user
        const { skip = 0, limit = 10 } = req.query;
        const Notifications = await notification.find({ user_id: user._id }).sort({ read: 1, createdAt: -1 }).skip(skip).limit(parseInt(limit));
        console.log('my notifications', Notifications);

        res.json({ Notifications })
    } catch (error) {
        console.log(error);
    }

}
const get_notification = async (req, res) => {
    try {
        const { userId } = req.params
        const Notification = await notification.findOne({ user_id: userId });
        console.log('my notifications', Notification);

        res.json({ Notification })
    } catch (error) {
        console.log(error);
    }

}
const read_notification = async (req, res) => {
    try {
        const { n_id } = req.params


        const Notification = await notification.findByIdAndUpdate(n_id, { read: true }, { new: true })
        console.log('notification', Notification);

        if (Notification) {
            res.status(200).send({ message: "updated", notification: Notification })
        }
    } catch (error) {
        console.log('error', error);

        // res.status(500).send({ error })
    }
}

 const delete_notification =async (req, res) => {
    const { n_id } = req.params


    try {
        const Notification = await notification.findByIdAndDelete(n_id)
        console.log(Notification,'n id',n_id);
         
        if (Notification) {
            res.status(200).send({ message: "deleted successfully"})
        }else{
            res.status(500).send({ message: "An error occured"})
     
        }
    } catch (error) {
        res.status(500).send({ error})

    }
    
}
module.exports = {
    new_notification, get_notifications, notify_all, notifyMembersOnly, read_notification, get_notification, delete_notification
}