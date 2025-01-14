// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path as necessary

require('dotenv').config()
// Middleware function to verify JWT
const authMiddleware =(allowedRoles)=> async (req, res, next) => {
    console.log(`Request URL: ${req.originalUrl}`);
    if (req.originalUrl ==='/api/universities/') {
        return next(); // Skip authMiddleware for this route
    }        
    const token = req.cookies?.accessToken;
    console.log('token',token);
    
    if (!token) {
        return res.redirect('/pages/login')
    }

    try {
        
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findOne({_id:decoded.id});
        console.log(allowedRoles,user.user_type);

        if (!user) {
           
            if (Array.isArray(allowedRoles) && allowedRoles.includes(1)) {
                return res.redirect('/pages/login');
            } else {
                return res.redirect('/pages/log-in');
            }
        }
        if (!user || !allowedRoles.includes(user.user_type)) {
            
            console.log('user type',user.user_type,'auth users',allowedRoles);

            return res.status(500).json({message:'You are not authorized for this action'});
        }
        req.user = user
        res.locals.user = user;
        res.locals.userType = user.user_type
        
         next()
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log(`DECODED ${token}`);
            
            res.locals.user = null;
        }
    
        console.log(error);
        
        res.redirect('/pages/login')
    }
};


module.exports = {authMiddleware};
