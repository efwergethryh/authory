const User = require('../models/User');
const RefreshToken = require('../models/refreshtoken');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;
const generateToken = (user, type, user_type) => {
    if (type === 'access') {
        return jwt.sign({ user_type, id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    } else if (type === 'refresh') {
        return jwt.sign({ user_type, id: user._id, email: user.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    } else {
        throw new Error('Invalid token type');
    }
};
const hashpassword = async (password) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword
};




const login = async (req, res) => {
    const { email, password, type } = req.body;
    console.log(type);
    
    try {
        const user = await User.findOne({
            user_type: type === "Owner" ? 3 : type === "Admin" ? 2 :type === "User" ?1:'',
            email: email
        });
        if (!user) {
            return res.status(404).json({ message: 'Account not found' });
        }
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const accessToken = generateToken(user, 'access', type === "Owner" ? 3 : type === "Admin" ? 2 : 1);
        const refreshToken = generateToken(user, 'refresh', type === "Owner" ? 3 : type === "Admin" ? 2 : 1);

        const refreshTokenRecord = new RefreshToken({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await refreshTokenRecord.save();

        res.cookie('accessToken', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error('Error during login:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const register = async (req, res) => {
    try {
        const body = req.body
        const { email, password } = body;
        console.log(body);

        const file = req.file;
        console.log(file);

        if (!file) {

            return res.status(500).json('No image was found');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'email already taken' });
        }
        const hashedPassword = await hashpassword(password)
        const newUser = new User({
            _id:body.phone_number,
            name: body.name,
            email: body.email,
            country: body.country,
            password: hashedPassword,
            looking_for: body.looking_for,
            project_branch: body.project_branch,
            type_of_study: body.type_of_study,
            scientific_interest: body.scientific_interest,
            project_title: body.project_title,
            profile_picture: file?file.filename:'non-picture.jpg',
            user_type: body.type === "Owner" ? 3 : body.type === "Admin" ? 2  : body.type === "User" ? 1:''
        });
        await newUser.save();
        
        const accessToken = generateToken(newUser, 'access');
        const refreshToken = generateToken(newUser, 'refresh');

        const refreshTokenRecord = new RefreshToken({
            userId: newUser._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await refreshTokenRecord.save();
        res.cookie('accessToken', accessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
        });
        res.status(201).json({ message: 'User registered successfully', accessToken, refreshToken });
    } catch (err) {
        console.error('Error during registration:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const refresh_token = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        console.log(user);

        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const tokenRecord = await RefreshToken.findOne({ token: refreshToken, userId: user._id });
        if (!tokenRecord) {
            return res.status(403).json({ message: 'Refresh token does not exist' });
        }

        const newAccessToken = generateToken(user, 'access');
        const newRefreshToken = generateToken(user, 'refresh');

        await RefreshToken.findByIdAndUpdate(tokenRecord._id, { token: newRefreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        console.error('Error during token refresh:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    login,
    register,
    refresh_token
};
