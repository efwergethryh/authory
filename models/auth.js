const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const RefreshToken = require('./refreshtoken');
require('dotenv').config();
var GoogleStrategy = require('passport-google-oauth20').Strategy;

// Helper to create JWT token
const generateToken = (user, type, user_type) => {
    if (type === 'access') {
        return jwt.sign({ user_type, id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    } else if (type === 'refresh') {
        return jwt.sign({ user_type, id: user._id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    } else {
        throw new Error('Invalid token type');
    }
};
async function generateUserId() {
    let uniqueId;
    let isUnique = false;

    while (!isUnique) {
        uniqueId = Math.floor(1000 + Math.random() * 9000); // Generate a 4-digit number

        // Check if this ID already exists in the database
        const existingUser = await User.findOne({ _id: uniqueId });
        if (!existingUser) {
            isUnique = true;
        }
    }

    return uniqueId;
}
// Function to generate a username from the email


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://ictoob.com/auth/google/callback',
    passReqToCallback: true,
    scope: ['profile', 'email', 'name'] // Specify the necessary scopes
}, async (req, accessToken, refreshToken, profile, done) => {
    console.log('profile',profile._json);
    const { sub,  email, picture,name, given_name, family_name } = profile._json;
    const userId = await generateUserId()

    try {
        // Check if the user already exists in the database
        const existingUser = await User.findOne({ email: email });
        

        if (existingUser) {
            const accessToken = generateToken(existingUser, 'access', 1);
            const refreshToken = generateToken(existingUser, 'refresh', 1);
            const refreshTokenRecord = new RefreshToken({
                userId: existingUser._id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            await refreshTokenRecord.save();
            req.res.cookie('accessToken', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
            });

            done(null, existingUser);
        } else {
            
            
            const hashedPassword = await bcrypt.hash('google-auth', 10);  // No password needed, but still hash for security reasons
            const newUser = new User({
                name,
                firstName:given_name,
                lastName:family_name,
                password: hashedPassword,
                email: email,
                profile_picture: picture,
                _id: userId,
                user_type: 1,
                googleId: sub
            });

            // Save new user to the database
            await newUser.save();

            // Generate a token for the new user and set it as a cookie
            const accessToken = generateToken(newUser, 'access', 1);
            const refreshToken = generateToken(newUser, 'refresh', 1);
            const refreshTokenRecord = new RefreshToken({
                userId: newUser._id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });

            await refreshTokenRecord.save();
            req.res.cookie('accessToken', accessToken, {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
            });

            // Return the new user through passport callback
            return done(null, newUser);
        }

    } catch (error) {
        // Handle any errors that occur during the process
        return done(error, null);
    }
}));

