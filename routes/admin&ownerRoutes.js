const express = require('express');
const router = express.Router()   
const userController = require('../Controllers/userController');
const { authMiddleware } = require('../Middlewares/authMiddleware');
const multer = require('multer')
const postController = require('../Controllers/postController')

const post_storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, 'public/post_images/');
    },
    filename: function (req, file, cb) {

        if (file) {
            console.log('file ', file);

            const filename = `${file.originalname}`;
            cb(null, filename);
        } else {
            console.log('no file found');

            cb(null, false);
        }
    }
})
const upload_post = multer({
    storage: post_storage
})


router.use(authMiddleware([2, 3]))
router.post('/new-post', upload_post.array('post-image'), postController.create_post)
router.put('/update-post/:post_id', upload_post.array('post-image'), postController.update_post)
router.put('/ban-user/:userId', userController.ban_user)
router.delete('/delete-post/:post_id', postController.delete_posts)



module.exports = router