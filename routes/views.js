const express = require('express')
const viewsRouter = require('../Controllers/viewsController')
const userController = require('../Controllers/userController')

const router = express.Router()
const passport = require('passport')

router.get('/auth/google', (req, res, next) => {
    console.log("Redirecting to Google OAuth...");
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })(req, res, next);
});

router.get('/auth/google/callback', passport.authenticate("google", {
    successRedirect: '/pages/home',
    failureRedirect: '/pages/login'
}))
router.get('/auth/facebook/', (req, res, next) => {
    passport.authenticate('facebook')(req, res, next);
})
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/pages/home');
    });
router.get('/', viewsRouter.landing);
router.get('/translations/:lang', viewsRouter.get_translation)
// router.get('/login', viewsRouter.login_view);
// router.get('/register', viewsRouter.register_view);
router.get('/conversation-layout', viewsRouter.conv_layout)
// router.get('/home', authMiddleware, viewsRouter.home_view);  
// router.get('/dashboard',authMiddleware.authMiddleware([1,2,3]),viewsRouter.dashboard)
// router.get('/custom-register',authMiddleware.authMiddleware([1,2,3]),)
router.get('/posts/:postId', viewsRouter.view_post)
router.get('/pages/:page', viewsRouter.render_page)
router.get('/api/universities/:value', userController.fetchUniversities);
module.exports = router