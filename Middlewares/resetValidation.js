const crypto = require('crypto');
const User = require('../models/User'); // Import your User model

const validateResetToken = async (req, res, next) => {
    
    try {
        const { token } = req.query;
        console.log('token',token);
        if (!token) {
            return res.status(400).send('Invalid or missing token.');
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        console.log('hashedToken',hashedToken);
        
        
        const user = await User.findOne({
            resetPasswordToken: hashedToken
        });

        if (!user) {
            return res.redirect('/pages/reset-password');
        }

       
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error.');
    }
};

module.exports = validateResetToken;
