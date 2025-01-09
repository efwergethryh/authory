const express = require('express')
const apiRouter = require('../Controllers/authController')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const uploadDir = path.join('public/profile_images/');
const authController = require('../Controllers/authController')

const registerationMiddleware = require('../Middlewares/registerationMiddleware')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true }); // Create the directory if it does not exist
}

router.post('/register',registerationMiddleware, apiRouter.register)
router.post('/login', apiRouter.login)
router.post('/set-cookie',authController.setCookie);

module.exports = router


