const mongoose = require('mongoose')


const joinedPapersSchema = mongoose.Schema(
    {
        paper_id: {
            type: String,
            ref: 'papers', required: true
        },
        user_id:{
            type: String,
            ref: 'users', required: true
        }
    },
    { timestamps: true }
)

const JoinedPaper = mongoose.model('JoinedPaper',joinedPapersSchema)
module.exports = JoinedPaper

