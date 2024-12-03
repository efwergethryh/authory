const ejs = require('ejs');
const path = require('path')
const userController = require('../Controllers/userController')
const paperController = require('../Controllers/papersController')
const fs = require('fs');
const { ownerOrAdminMiddleware, authMiddleware } = require('../Middlewares/authMiddleware');
const Post = require('../models/Post');
const checkBanStatus = require('../Middlewares/banMiddleware');
const registerationMiddleware = require('../Middlewares/registerationMiddleware');
const landing = (req, res) => {
    res.render('landing_page');
};
const login_view = (req, res) => {
    res.render('login');
};
const view_post = async (req, res) => {
    try {
        const { postId } = req.params
        const post = await Post.findById(postId)
        if(!post){
            res.redirect('/pages/notfound')
        }

        res.render('post', { post })
    } catch (error) {
        res.render('errorPage')
    }
}
const register_view = (req, res) => {
    res.render('register');
};
const dashboard = (req, res) => {
    res.render('dashboard')
}



const render_page = async (req, res, next) => {
    const { page } = req.params;

    try {
        if (page) {
            const filePath = path.resolve(__dirname, '../views', `${page}.ejs`);

            // console.log(filePath);
            
            if (page === 'dashboard' || page === 'custom-register') {
                // Run `authMiddleware` and `checkBanStatus` in sequence
                await authMiddleware([2, 3])(req, res, async (authErr) => {
                    if (authErr) return next(authErr); // Pass error if auth fails

                    // Check ban status
                    await checkBanStatus(req, res, (banErr) => {
                        if (banErr) return next(banErr); // Forward ban errors to next middleware

                        // If both middlewares pass, render the page
                        renderPageIfExists(filePath, req, res);
                    });
                });
                return; // Prevent further execution
            }
            if (page === 'home') {
                // Run `authMiddleware` and `checkBanStatus` in sequence
                await authMiddleware([1, 2, 3])(req, res, async (authErr) => {
                    if (authErr) return next(authErr); // Pass error if auth fails

                    // Check ban status
                    await checkBanStatus(req, res, (banErr) => {
                        if (banErr) return next(banErr); // Forward ban errors to next middleware

                        // If both middlewares pass, render the page
                        renderPageIfExists(filePath, req, res);
                    });
                });
                return; // Prevent further execution
            }
            if (page === 'personalization') {
                // Run `authMiddleware` and `checkBanStatus` in sequence
                await registerationMiddleware(req, res, async (authErr) => {
                    if (authErr) return next(authErr); // Pass error if auth fails

                    
                    renderPageIfExists(filePath, req, res);
                });
                return; 
            }

            renderPageIfExists(filePath, req, res);
        } else {
            return res.render('notFound');
        }
    } catch (err) {
        console.error('Error rendering page:', err);
        return res.status(500).send('Internal Server Error'); // Handle server errors
    }
};

// Helper function to check file existence and render
const renderPageIfExists = (filePath, req, res) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
            // File exists, render it
            return res.render(req.params.page);
        } else {
            // File does not exist, render 404 page
            return res.render('notFound');
        }
    });
};



const home_view = async (req, res) => {
    const user = res.locals.user
    console.log('logged user', user);

    try {
        const friends = await userController.get_users()
        const joinedpapers = await paperController.get_joined_paper(user._id, null);
        const papers = await paperController.get_papers(user._id, null)
        return res.render('home', { joinedpapers, friends, papers, userId: user._id, user });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error');
    }
};

const conv_layout = (req, res) => {
    const conversations = [
        {
            conversation: [
                {
                    title: "Welcome chat",
                    picture: "images/welcome.png",
                },

            ]
        },

    ];

    // Construct the path to the EJS file
    const ejsPath = path.join(__dirname, '..', 'views', 'layouts', 'conversation.ejs');

    // Render the EJS file with conversations data
    ejs.renderFile(ejsPath, { conversations }, (err, html) => {
        if (err) {
            console.error('Error rendering EJS:', err);
            return res.status(500).send('Error rendering EJS');
        }
        res.send(html);
    });
};
const get_translation = (req, res) => {
    const lang = req.params.lang;
    const filePath = path.resolve(__dirname,`../translations/${lang}.json`);
    console.log('file path',filePath,'dir',__dirname);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(err.status).send('Translation file not found');
        }
    });

}
module.exports = {
    landing,
    login_view,
    register_view, home_view,
    conv_layout,
    dashboard,
    render_page, view_post,get_translation
}