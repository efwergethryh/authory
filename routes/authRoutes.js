const express = require('express')
const apiRouter = require('../Controllers/authController')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const uploadDir = path.join('public/profile_images/');
const authController = require('../Controllers/authController')
const validateRefreshToken = require('../Middlewares/refreshTokenMiddleware')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it does not exist
}
const storage = multer.diskStorage({
    // Define where to store the uploaded files
    destination: function (req, file, cb) {
        cb(null, 'public/profile_images/'); 
    },
    // Define how to name the uploaded files
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

const upload = multer({
    storage: storage,

});
router.post('/register',  upload.single('profile_picture'), apiRouter.register)
router.post('/login', apiRouter.login)


router.post('/refresh_token',validateRefreshToken, authController.refresh_token);
module.exports = router


