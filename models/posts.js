const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title: {
        type: String
    },
    body: {
        type: String
    },
    createdOn: {
        type: Date
    },
    creator: {
        type: String,
        required: true,
        default: 'Anonymous'
    } 
})


const Post = mongoose.model('Post', PostSchema)

module.exports = Post