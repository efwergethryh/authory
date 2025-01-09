
const User = require('../models/User');
const mongoose = require('mongoose');
const axios = require('axios')
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
        searchCriteria.push({ _id: query }, { email: query }, { name: query },{ firstName: query },{ lastName: query });
        console.log('criteria',searchCriteria);
        
        const user = await User.find({ $or: searchCriteria }).select('-password');
        console.log("User", user);

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
        users = await User.find({ _id: { $ne: id }, user_type }).select('-password')
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
let fetch;

async function loadFetch() {
    fetch = (await import('node-fetch')).default; // Fetch is now assigned globally
}

loadFetch()

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
                    _id: body.phone_number,
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
                        _id: body.phone_number,
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
        const user = await User.findByIdAndUpdate(userId, {
            banned: true
        })
        if (user) {


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
        const admin = await User.findOneAndUpdate({ _id: adminId, user_type: 2 }, {
            user_type: 1
        })
        console.log('admin', admin);

        if (admin) {

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
        const user = await User.findOneAndUpdate({ _id: userId, user_type: 1 }, {
            user_type: 2
        })
        if (user) {
            user.user_type = 2

            res.json({ message: "Admin have been Set" })

        } else {
            res.json({ message: "User Not found" })

        }
    } catch (error) {
        res.json({ error })
    }
}
const fetchUniversities = async (req, res) => {
    const { value } = req.params; 
    console.log('value',value);
    
    try {
        // Make the GET request using Axios
        const apiResponse = await axios.get(`http://universities.hipolabs.com/search?country=${value}`);

        // Axios automatically parses the response as JSON, so no need for .json()
        const data = apiResponse.data;

        // Send the data back in the response
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' }); // Handle errors
    }
}

const update_profile = async (req, res) => {
    console.log('req',req.file);
    try {
        const userId = req.user._id; // Assuming `req.user` contains logged-in user's details
        let { fieldsToUpdate } = req.body; // Destructure fieldsToUpdate from the request body
    
        
        if (!fieldsToUpdate || fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No updates provided" });
        }
    
        const allowedFields = ['firstName', 'lastName', 'email', 'name','country','university', 'profile_picture'];
        const userUpdates = {};
        fieldsToUpdate = fieldsToUpdate ? JSON.parse(fieldsToUpdate) : [];

        // Validate and filter the fields
        fieldsToUpdate.forEach(({ field, value }) => {
            console.log('Field:', field, 'Value:', value);
            if (
                allowedFields.includes(field) && // Field is allowed
                typeof value === 'string' && // Value is a string
                value.trim() !== '' // Value is not empty
            ) {
                userUpdates[field] = value.trim(); // Add the field to the updates object
            }
        });
        if (req.file) {
            console.log('req.file',req.file.filename)
            // Assuming the file field is called 'profile_picture'
            if (allowedFields.includes('profile_picture')) {
               
                userUpdates.profile_picture =req.file.filename; // Add file path to updates
            }
        }
        console.log('user updates',userUpdates);
        
        if (Object.keys(userUpdates).length === 0) {
            return res.status(400).json({ message: "No valid updates provided" });
        }
    
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: userUpdates }, // Apply updates
            { new: true } // Return the updated document
        );
    
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
    
        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }     
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
const change_password = async (req, res) => {
    const body = req.body
    const new_password = body.new_password
    const password = body.password
    const user = res.locals.user
    console.log('password', password, 'body', body);

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        res.status(500).json({ message: "Passowrd is incorrect" })
    }

    else {
        const hashedPassword = await hashpassword(new_password)

        const userUpdated = await User.findByIdAndUpdate(user._id, {
            $set: {
                password: hashedPassword
            }
        })
        res.status(200).json({ message: "Password has been changed", })
    }

}
const update_phone = async (req,res)=>{
    try {
        const {value} = req.body
        console.log('body',req.body);
        
        const userId = res.locals.user._id
        console.log('value',value);
        
        const user =await User.findByIdAndUpdate(userId,{
            phoneHidden:value=='public'?false:true
        })
        return res.status(200).json({ message: "Updated sucessfully" });
    } catch (error) {
        return res.status(400).json({ message: "An error ocurred" });

    }

}
module.exports = {
    get_user, get_users,
    createOwner, ban_user, degrade_admin, set_admin, fetchUniversities,
    update_profile, change_password,
    update_phone

}