const express = require('express')
const viewsRouter = require('../Controllers/viewsController')
const router = express.Router()


router.get('/', viewsRouter.landing);
router.get('/translations/:lang',viewsRouter.get_translation)   
// router.get('/login', viewsRouter.login_view);
// router.get('/register', viewsRouter.register_view);
router.get('/conversation-layout',viewsRouter.conv_layout)
// router.get('/home', authMiddleware, viewsRouter.home_view);  
// router.get('/dashboard',authMiddleware.authMiddleware([1,2,3]),viewsRouter.dashboard)
// router.get('/custom-register',authMiddleware.authMiddleware([1,2,3]),)
router.get('/posts/:postId',viewsRouter.view_post)
router.get('/pages/:page',viewsRouter.render_page)     
module.exports = router