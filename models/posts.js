const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        maxlength: 100
    },
    body: {
        type: String,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        required: true
    },
    lastUpdatedAt: {
        type: Date
    },
    creator: {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true    
        }
    } 
})


const Post = mongoose.model('Post', PostSchema)

module.exports = Post