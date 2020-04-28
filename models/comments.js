const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: true
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
    },
    createdAt: { 
        type: Date,
        required: true
    },
    lastUpdatedAt: {
        type: Date
    },
    votes: {
        up: {
            type: Number,
            default: 0
        },
        down: {
            type: Number,
            default: 0
        }
    }
})


module.exports = CommentSchema