const jwt = require('jsonwebtoken');
require('dotenv').config()

// Middleware to validate the refresh token
const validateRefreshToken = (req, res, next) => {
    const refreshToken = req.body.refreshToken;
    console.log('ref',refreshToken);
    
    // Check if token exists
    if (!refreshToken) {
        res.redirect('/login')
    }

    // Validate the refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired refresh token' });
        }

        req.user = user;

        next();
    });
};

module.exports = validateRefreshToken;
