// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path as necessary
const checkBanStatus = require('./banMiddleware');
require('dotenv').config()
// Middleware function to verify JWT
const authMiddleware =(allowedRoles)=> async (req, res, next) => {
    
    
    const token = req.cookies?.accessToken;
    
    
    if (!token) {
        return res.redirect('/pages/login')
    }

    try {
        
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        console.log('decoded.id',decoded.id);
        //_id:
        const user = await User.findOne({_id:decoded.id});
        console.log('authorized user',user);
        
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
        
        res.redirect('/login')
    }
};
const ownerAdminMiddleware = (allowedRoles)=>async(req, res, next)=>{
    const token = req.cookies?.accessToken;

    if (!token) {
        return res.redirect('/pages/log-in')
    }

    try {
        
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
           
            return res.redirect('/pages/log-in')
        }
        if (!user || !allowedRoles.includes(user.user_type)) {
            // Redirect if user is not found or not in allowed roles
            return res.redirect('/pages/log-in');
        }
        res.locals.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            
            
            res.locals.user = null;
        }
        
        console.log(error);
        
        res.redirect('/pages/log-in')
    }
}


const ownerOrAdminMiddleware = ownerAdminMiddleware(["Owner", "Admin"]);
module.exports = {authMiddleware,ownerOrAdminMiddleware};
