const Post = require('../models/Post');
const mongoose = require('mongoose')


const create_post = async (req, res) => {
    try {
        const body = req.body
        console.log(body);
        console.log(req.file);
        const myId = res.locals.user._id

        let postImages = [];
        // Ensure that req.files exists and has files
        if (req.files && req.files.length > 0) {
            // Map the uploaded files to their paths
            postImages = req.files.map(file => file.path);
        } else {
            console.log("No files uploaded");
        }

        const post = new Post({
            title: body.title,
            content: body.content,
            tags: body.tags,
            post_image: postImages,
            user_id:myId
        })
        await post.save()
        res.status(200).json({ message: 'Post Published' })
    } catch (error) {
        console.log(error);

    }
}
const get_posts = async (req, res) => {
    try {
        const posts = await Post.find()
        res.status(200).json({ posts })

    } catch (error) {
        res.status(500).json({ message: error })
    }
}
const delete_posts = async (req, res) => {
    const { post_id } = req.params
    const post = await Post.findById(post_id)
    res.json({ message: "Post deleted succefully" })
    if (post) await post.deleteOne()
}
const get_post = async (req, res) => {
    try {
        const { post_id } = req.params
        const post = await Post.findById(post_id)
        if (!post) {
            res.status(500).json({ message: 'Post not found' })
        }
        else {

            res.status(200).json({ post })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ err })
    }
}
const update_post = async (req, res) => {
    const { post_id } = req.params
    let postImages = [];
    // Ensure that req.files exists and has files
    if (req.files && req.files.length > 0) {
        // Map the uploaded files to their paths
        postImages = req.files.map(file => file.path);
    } else {
        console.log("No files uploaded");
    }
    const body = req.body
    console.log(body);
    const post = await Post.findByIdAndUpdate(post_id, {
        title: body.title,
        content: body.content,
        tags: body.tags,
        post_image: postImages,
    }, {
        new: true,

    })

    res.status(200).json({ message: "Updated successfully" })
    try { } catch (err) {
        res.status(500).json({ err })
    }

}
module.exports = {
    create_post, get_posts, delete_posts, get_post,
    update_post
}