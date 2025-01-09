const nodemailer = require("nodemailer");
require('dotenv').config();
const transporter = nodemailer.createTransport({

    service: "gmail", 
    auth: {
        type: 'OAuth2',
        user: "bttt8888444@gmail.com",
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN_SECRET
    },
    
});

module.exports = transporter