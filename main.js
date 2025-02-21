const express = require('express');
const viewsRouter = require('./routes/views');
const authRouter = require('./routes/authRoutes');
const apisRouter = require('./routes/apis');
const admin_ownerRoutes = require('./routes/admin&ownerRoutes');
const OwnerRoutes = require('./routes/OwnerRouters');
const app = express();
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { m_connect } = require('./connection');
const passport = require('passport');
const http = require('http');
const multer = require('multer'); 
const path = require('path')
const fs = require('fs');
// Database connection
m_connect();





app.use(cors({
    origin: [
        'https://145.223.34.195',
        'http://localhost:3000',
    ],  // Allow all origins for debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));

app.use(cookieParser());

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', './views'); // Optional: Specify the 'views' folder if it's not in the default location
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.static('public'));
// Routes
app.use('/', viewsRouter);
app.use('/api/auth', authRouter);
app.use('/api/', apisRouter); 
app.use('/api/owner',OwnerRoutes)
app.use('/api/admin',admin_ownerRoutes)

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin:["https://scholagram.com","http://localhost:3000"],
        methods: ["GET", "POST","DELETE","PUT"],
        
    }   
});
require('./Sockets/paperConversationSocket')(io);
require('./Sockets/notificationsSocket')(io);

const port = 3000;
server.listen(port,'0.0.0.0');
