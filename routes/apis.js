const paperController = require('../Controllers/papersController');
const express = require('express');
const {authMiddleware, ownerOrAdminMiddleware} = require('../Middlewares/authMiddleware');

const userController = require('../Controllers/userController');
const conversationController = require('../Controllers/conversationController');
const notificationController = require('../Controllers/notificationController')
const postController = require('../Controllers/postController')
const multer = require('multer')
const friendsConversationController = require('../Controllers/friendsConversationController');

const requestController = require('../Controllers/requestController');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Only set the destination when there is a file for private conversations
        console.log('body', req.body);
        cb(null, 'public/conversation_images/');

    },
    filename: function (req, file, cb) {

        if (file) {
            const timestamp = Date.now(); // Add a timestamp to the file name
            const filename = `${timestamp}-${file.originalname}`;
            cb(null, filename);
        } else {
            cb(null, false); // No file, so no filename is generated
        }
    }
});

const uploadConversation = multer({
    storage: storage,
});
const conversation_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('request body',req.body,'request file',req.file);
        console.log('File ',file);
        cb(null, 'public/conversation_files/');
    },
    filename: function (req, file, cb) {
        
        if (file) {
            console.log('file ',file);
            
            const filename = `${file.originalname}`;
            cb(null, filename);
        } else {
            console.log('no file found');
            
            cb(null, false); 
        }
    }
});
const uploadFile =multer({
    storage:conversation_storage
})
const post_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        cb(null, 'public/post_images/');
    },
    filename: function (req, file, cb) {
        
        if (file) {
            console.log('file ',file);
            
            const filename = `${file.originalname}`;
            cb(null, filename);
        } else {
            console.log('no file found');
            
            cb(null, false); 
        }
    }
})
const upload_post = multer({
    storage:post_storage
})
//,upload_post.single('post-image')
const router = express.Router();
router.post('/get-user', userController.get_user);
router.post('/create-owner',userController.createOwner)




router.use(authMiddleware([1,2,3]));
router.get('/users/:user_type', userController.get_users);
router.post('/new-conversation', uploadConversation.single('conv_pic'), conversationController.add_conversation);
router.post('/search-papers', paperController.search_papers);
router.post('/send-message/:conversation_id', conversationController.send_message);
router.post('/send-tofriend/:receiver_id',uploadFile.single('file'),friendsConversationController.sendMessageTofriend);
router.post('/create-paper', paperController.create_paper);     
router.post('/join-paper/:paper_id', paperController.join_paper);
router.post('/notify/:id', notificationController.new_notification)
router.post('/notify-all', notificationController.notify_all)
router.post('/notify-members', notificationController.notifyMembersOnly)
router.post('/create-request/:paper_id', requestController.create_request)
router.post('/accept-request/:paper_id', requestController.accept_request)

//get routes
router.get('/get-friendconversation/:id', friendsConversationController.getFriendConversation);
router.get('/get-friendconversations', friendsConversationController.getFriendConversations);

router.get('/papers',paperController.get_papers)
router.get('/paper/:paper_id', (req, res) => paperController.get_paper(null, req, res));
router.get('/messages/:id', conversationController.get_message);
router.get('/conversations/:id', conversationController.get_conversations);
router.get('/notifications', notificationController.get_notifications)
router.get('/joinedPapers',(req,res)=> paperController.get_joined_paper(null,req,res));
router.get('/get-request', requestController.get_requests);
router.get('/get-joined-users/:paper_id',paperController.joined_papers_users);
router.get('/posts',postController.get_posts)
router.get('/posts/:post_id',postController.get_post)
// Delete Routes
router.delete('/delete-paper/:paper_id',paperController.delete_paper);
router.delete('/delete-user-from-paper/:paper_id',paperController.delete_user_from_paper);
//Put routes
router.put('/update-paper/:id',paperController.update_paper)


router.use(authMiddleware([2,3]))
router.post('/new-post',upload_post.array('post-image'),postController.create_post)


router.put('/update-post/:post_id',upload_post.array('post-image'),postController.update_post)
router.put('/ban-user/:userId',userController.ban_user)
router.delete('/delete-post/:post_id',postController.delete_posts)

router.use(authMiddleware([3]))
router.put('/degrade-admin/:adminId',userController.degrade_admin)
router.put('/set-admin/:userId',userController.set_admin)


module.exports = router