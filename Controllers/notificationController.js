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
        res.json({ message: "Notification sent", user,Notification })
    } catch (error) {
        console.log(error);

    }
}
const notify_all = async (req, res) => {
    try {
        const me = res.locals.user;
        const { type, post_id } = req.body;

        const limit = parseInt(req.query.limit) || 10; // Number of users per batch
        const skip = parseInt(req.query.skip) || 0;

        // Retrieve users in batches
        const users = await User.find({ _id: { $ne: me } })
            .skip(skip)
            .limit(limit);

        // Check if users exist
        if (users.length === 0) {
            return res.status(200).json({ message: "No more users to notify" });
        }

        // Batch save notifications
        const notificationsBatch = users.map(user => ({
            sender: me._id,
            user_id: user._id,
            type,
            post_id: post_id || null,
        }));

        const notification = await notifications.insertMany(notificationsBatch);
        
        res.status(200).json({
            message: "Batch of users notified",
            notifiedCount: notificationsBatch.length,
            notifiedUsers: users, // Include the notified users in the response
            sender: me._id,
        });
    } catch (error) {
        console.error("Error notifying users:", error);
        res.status(500).json({ error: "Failed to notify users" });
    }
};

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
        const Notifications = await notification.aggregate([
            { $match: { user_id: user._id } }, // Filter notifications for the specific user
            { $sort: { read: 1, createdAt: -1 } }, // Sort by 'read' and 'createdAt'
            { $skip: parseInt(skip) }, 
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'paper', // Name of the 'paper' collection
                    localField: 'paper_id', // Field in 'notification' collection
                    foreignField: '_id', // Field in 'paper' collection
                    as: 'paper_info' // Name of the field to include the joined data
                }
            },
            {
                $lookup: {
                    from: 'post', // Name of the 'paper' collection
                    localField: 'post_id', // Field in 'notification' collection
                    foreignField: '_id', // Field in 'paper' collection
                    as: 'post_info' // Name of the field to include the joined data
                }
            },
            {
                $lookup: {
                    from: 'users', // Join with 'users' collection
                    localField: 'sender', // Field in 'notification' collection (assuming 'sender_id')
                    foreignField: '_id', // Field in 'users' collection
                    as: 'sender_info' // Name of the field for the joined data
                }
            },
            {
                $unwind: { 
                    path: "$paper_info", 
                    preserveNullAndEmptyArrays: true // Keep notifications even if no matching paper is found
                }
            },
            {
                $unwind: { 
                    path: "$sender_info", 
                    preserveNullAndEmptyArrays: true // Keep notifications even if no matching sender is found
                }
            },
            {
                $unwind: { 
                    path: "$post_info", 
                    preserveNullAndEmptyArrays: true // Keep notifications even if no matching sender is found
                }
            }
        ]);
        
        // const Notifications = await notification.find({ user_id: user._id }).sort({ read: 1, createdAt: -1 }).skip(skip).limit(parseInt(limit));
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
        if(!Notification){
            res.status(500).send({ message: "An error occured"})
        }
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
    new_notification,
     get_notifications,
      notify_all, notifyMembersOnly,
       read_notification,
        get_notification,
         delete_notification
}