const express = require('express');
const viewsRouter = require('../Controllers/viewsController');
const userController = require('../Controllers/userController');
const { authMiddleware } = require('../Middlewares/authMiddleware');
const validateResetToken = require('../Middlewares/resetValidation');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

// Public routes that don't require authentication
router.get('/auth/google', (req, res, next) => {
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })(req, res, next);
});


router.get('/auth/google/callback', passport.authenticate("google", {
    successRedirect: '/pages/home',
    failureRedirect: '/pages/login',
}));

router.get('/auth/facebook/', (req, res, next) => {
    
    passport.authenticate('facebook')(req, res, next);
});

router.get('/auth/facebook/callback',passport.authenticate('facebook', {
        
        successRedirect: '/pages/home',
        failureRedirect: '/pages/login'
    }),

);

router.get('/', viewsRouter.landing);
router.get('/translations/:lang', viewsRouter.get_translation);
router.get('/conversation-layout', viewsRouter.conv_layout);

router.get('/posts/:postId', viewsRouter.view_post);
router.get('/pages/:page', viewsRouter.render_page);

router.get('/profile', authMiddleware([1, 2, 3]), (req, res) => {
    res.render('profile');
});
router.get('/sockettest', authMiddleware([1, 2, 3]), (req, res) => {
    res.render('sockettest')
})
router.get('/preset', validateResetToken, async (req, res) => {
    res.render('preset')
});

module.exports = router;
