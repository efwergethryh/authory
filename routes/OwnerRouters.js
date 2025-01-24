const express = require('express');
const router = express.Router()   
const userController = require('../Controllers/userController');
const { authMiddleware } = require('../Middlewares/authMiddleware');


router.use(authMiddleware([3]))
router.put('/degrade-admin/:adminId', userController.degrade_admin)
router.put('/set-admin/:userId', userController.set_admin)
module.exports = router