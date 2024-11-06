
const checkBanStatus = (req, res, next) => {
    try {
        const user = req.user;
        
        
        if (!user) {
            return res.status(401).send('User not authenticated');
        }

        if (user.banned) {
            return res.redirect('/pages/Banned');
           }

        next(); // Call next to proceed if the user is not banned
    } catch (error) {
        next(error); // Pass any errors to the error-handling middleware
    }
};


module.exports = checkBanStatus