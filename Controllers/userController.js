
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config()
const bcrypt = require('bcrypt')
const get_user = async (req, res) => {
    try {
        let searchCriteria = []
        const { query } = req.body
        console.log(query);
        
        // if (mongoose.Types.ObjectId.isValid(query)) {
        //     searchCriteria.push({  });
        // }
        searchCriteria.push({_id: query},{ email: query }, { name: query });

        const user = await User.find({ $or: searchCriteria }).select('-password');
        console.log("User",user);
        
        res.status(200).json({ user })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error finding your friend!' });
    }
}
const get_users = async (req, res) => {

    try {
        let users;
        const { user_type } = req.params
        console.log(user_type);
        
        if (!res) {
            users = await User.find();
            return users
        }
        console.log(user_type);
        
        const id = res.locals.user._id
        users = await User.find({ _id: { $ne: id },user_type}).select('-password')
        res.status(200).json({ users })
    }
    catch (error) {
        console.log(error.message);
        return 'error'
    }
}
const hashpassword = async (password) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword
};
let creationStatus = process.env.ALLOWED === 'true';
const createOwner = async (req, res) => {
    try {
        const body = req.body;

        if (body.type === 'Admin') {
            const existingUser = await User.findOne({ email: body.email })
            if (existingUser) {
                return res.status(500).json({ message: "This email is already taken" })
            } else {
                const hashedPassword = await hashpassword(body.password);
                const Admin = new User({
                    _id:body.phone_number,
                    name: body.name,
                    email: body.email,
                    password: hashedPassword,
                    user_type: 2
                })
                await Admin.save()
                return res.status(200).json({ message: "Admin has been Added successfully" });

            }

        } else {
            if (!creationStatus) {
                return res.status(500).json({ message: "An Error happened" });
            } else {
                const existingOwner = await User.findOne({ user_type: 3 });
                if (existingOwner) {
                    return res.status(500).json({ message: "An owner already exists" });
                } else {

                    const hashedPassword = await hashpassword(body.password);
                    const Owner = new User({
                        _id:body.phone_number,
                        name: body.name,
                        email: body.email,
                        password: hashedPassword,
                        user_type: 3
                    });
                    await Owner.save();

                    creationStatus = false;  // Update the internal flag, not process.env

                    return res.status(200).json({ message: "Owner has been created successfully" });
                }
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message })

    }
};
const ban_user = async (req, res) => {
    const { userId } = req.params
    try {
        const user = await User.findById(userId)
        if (user) {
            user.banned = true
            await user.save()
            res.json({ message: "User have been banned" })
        }
        else {
            res.json({ message: "User Not found" })
        }
    } catch (error) {
        res.json({ error })
    }
}   
const degrade_admin = async (req, res) => {
    const { adminId } = req.params
    try {
        const admin = await User.findOne({ _id: adminId, user_type: 2 })
        if (admin) {
            admin.user_type = 1
            await admin.save()
            res.json({ message: "Admin have been degraded" })

        } else {
            res.json({ message: "Admin Not found" })

        }
    } catch (error) {
        res.json({ error })

    }
}
const set_admin = async (req, res) => {
    const { userId } = req.params
    try {
        const user = await User.findOne({ _id: userId, user_type: 1 })
        if (user) {
            user.user_type = 2
            await user.save()
            res.json({ message: "Admin have been Set" })

        } else {
            res.json({ message: "User Not found" })

        }
    } catch (error) {
        res.json({ error })

    }
}
module.exports = {
    get_user, get_users,
    createOwner, ban_user, degrade_admin,set_admin
}