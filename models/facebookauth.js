const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();
const FacebookStrategy = require('passport-facebook').Strategy;
const createToken = (id) => jwt.sign({ userId: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
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
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/callback",
//     profileFields: ['id', 'displayName', 'emails', 'photos'],
//     passReqToCallback: true
//   },
//   async function(accessToken, refreshToken, profile, done) {
    
//     const { sub, name, email, picture } = profile;
    
//     try {
//         // Check if the user already exists in the database
//         const existingUser = await User.findOne({ googleId: sub });

//         if (existingUser) {
//             // User exists, generate a JWT token and set it as a cookie
//             const token = createToken(existingUser._id);
//             req.res.cookie("jwt", token, { 
//                 maxAge: 3600000, 
//                 httpOnly: true, 
//                 secure: process.env.NODE_ENV === 'production' // Use HTTPS in production
//             });

//             // Return the user through passport callback
//             done(null, existingUser);
//         } else {
//             // User doesn't exist, create a new user
//             const hashedPassword = await bcrypt.hash('google-auth', 10);  // No password needed, but still hash for security reasons
//             const newUser = new User({
//                 name: name,
//                 password: hashedPassword, // Default password value for Google OAuth users
//                 email: email,
//                 profile_picture: picture, // Google profile picture
//                 // Generate username from email
//                 _id:'0000',
//                 user_type:1,
//                 facebookId: sub
//             }); 

//             // Save new user to the database
//             await newUser.save();

//             // Generate a token for the new user and set it as a cookie
//             const token = createToken(newUser._id);
//             req.res.cookie("jwt", token, {
//                 maxAge: 3600000, 
//                 httpOnly: true, 
//                 secure: process.env.NODE_ENV === 'production' // Use HTTPS in production
//             });

//             // Return the new user through passport callback
//             return done(null, newUser);
//         }

//     } catch (error) {
//         // Handle any errors that occur during the process
//         return done(error, null);
//     }
//   }
// ));
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "https://scholagram.com/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'emails', 'photos'],
    scope: ['email'], 
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => { 
    // Access profile information directly from the Facebook profile object
    const facebookId = profile.id; 
    const name = profile.displayName;
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null; 
    const picture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
    const userId =await  generateUserId()
    
    try {
        let user = await User.findOne({ facebookId });

        if (user) {
            const token = createToken(user._id);
            req.res.cookie("jwt", token, {
                maxAge: 3600000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });
            return done(null, user);
        } else {
            const hashedPassword = await bcrypt.hash('facebook-auth', 10);
            user = new User({
                name,
                password: hashedPassword,
                email,
                profile_picture: picture,
                facebookId,
                _id:`${userId}`,
                user_type:1
            });

            await user.save();

            const token = createToken(user._id);
            req.res.cookie("jwt", token, {
                maxAge: 3600000,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            return done(null, user);
        }
    } catch (error) {
        return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});