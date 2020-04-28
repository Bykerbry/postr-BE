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
    },
    comments: [{
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
    }]
})


PostSchema.virtual('netVotes').get(function () {
    return this.votes.up - this.votes.down
})

const Post = mongoose.model('Post', PostSchema)

module.exports = Post