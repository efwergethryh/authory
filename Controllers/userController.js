
const User = require('../models/User');
const mongoose = require('mongoose');
const axios = require('axios')
require('dotenv').config()
const bcrypt = require('bcrypt')
const get_user = async (req, res) => {
    try {
        let searchCriteria = [];
        const { query } = req.body;

        const myId = res.locals.user._id
        // Create search criteria
        searchCriteria.push(
            { _id: (query) }, // Valid ObjectId
            { email: query },
            { name: query },
            { firstName: query },
            { lastName: query }
        );

        // Remove invalid criteria (e.g., null _id if query is not an ObjectId)
        searchCriteria = searchCriteria.filter(criterion => Object.values(criterion)[0]);


        // Aggregation pipeline 
        const users = await User.aggregate([
            {
                $match: {
                    $or: searchCriteria
                },// Match the specific user
            },
            {
                $lookup: {
                    from: "friendsconversations",
                    let: { userId: { $toString: "$_id" }, myId: { $toString: "$myId" } }, // Convert user _id to string
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $and: [{ $eq: ["$sender", "$$userId"] }, { $eq: ["$receiver", myId] }] },
                                        { $and: [{ $eq: ["$receiver", "$$userId"] }, { $eq: ["$sender", myId] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "f_conversation"
                },

            },
            {
                $unwind: {
                    path: "$f_conversation", // Extract the first element of the array
                    preserveNullAndEmptyArrays: true // Keep users without matching conversations
                }
            }




        ]);



        res.status(200).json({ users });
    }
    catch (error) {
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
        const name = body.name.trim().split(" ");
        console.log('name', name);

        const firstName = name[0];
        const lastName = name.slice(1).join(" ");
        console.log(firstName, lastName);
        if (body.type === 'Admin') {
            const existingUser = await User.findOne({ email: body.email })
            if (existingUser) {
                return res.status(500).json({ message: "This email is already taken" })
            } else {
                const hashedPassword = await hashpassword(body.password);
                const Admin = new User({
                    _id: body.phone_number,
                    name: body.name,
                    lastName: lastName,
                    firstName: firstName,
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
                        lastName: lastName,
                        firstName: firstName,
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
        console.log('error', error);

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

    try {
        let apiResponse
        // Make the GET request using Axios
        if (value !== '') {
            apiResponse = await axios.get(`http://universities.hipolabs.com/search?country=${value}`);

        } else {
            apiResponse = await axios.get(`http://universities.hipolabs.com/search`);
        }

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
    console.log('req', req.file);
    try {
        const userId = req.user._id; // Assuming `req.user` contains logged-in user's details
        let { fieldsToUpdate } = req.body; // Destructure fieldsToUpdate from the request body


        if (!fieldsToUpdate || fieldsToUpdate.length === 0) {
            return res.status(400).json({ message: "No updates provided" });
        }

        const allowedFields = ['firstName', 'lastName', 'email', 'name', 'country', 'university', 'profile_picture'];
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
            console.log('req.file', req.file.filename)
            // Assuming the file field is called 'profile_picture'
            if (allowedFields.includes('profile_picture')) {

                userUpdates.profile_picture = req.file.filename; // Add file path to updates
            }
        }
        console.log('user updates', userUpdates);

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
    try {
        const body = req.body
        const new_password = body.new_password
        const password = body.password
        const user = res.locals.user

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(500).json({ message: "Passowrd is incorrect" })
        }

        else {
            const hashedPassword = await hashpassword(new_password)
            // const passwordRegex = /^(?=.*[A-Z])(?=.*[\d!@#$%^&*(),.?":{}|<>]).{8,}$/;
            const errors = [];
            if (!new_password) errors.push("Password is required.");
            if (new_password.length < 8) errors.push("Password must be at least 8 characters long.");
            if (!/[A-Z]/.test(new_password)) errors.push("Password must contain at least one uppercase letter.");
            if (!/\d/.test(new_password)) errors.push("Password must contain at least one number.");
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(new_password)) errors.push("Password must contain at least one special character.");

            // If errors exist, return JSON response
            if (errors.length > 0) {
                return res.status(400).json({ message:errors });
            }
            else {
                const userUpdated = await User.findByIdAndUpdate(user._id, {
                    $set: {
                        password: hashedPassword
                    },
                })
                res.status(200).json({ message: "Password has been changed", })
            }
        }
    } catch (error) {
        res.status(500).json({ message: error })

    }

}
const update_phone = async (req, res) => {
    try {
        const { value } = req.body
        console.log('body', req.body);

        const userId = res.locals.user._id
        console.log('value', value);

        const user = await User.findByIdAndUpdate(userId, {
            phoneHidden: value == 'public' ? false : true
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