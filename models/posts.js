const mongoose = require('mongoose')
const CommentSchema = require('./comments')

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
        }, 
        profilePicture: {
            type: String
        }
    },
    votes: {
        up: {
            count: {
                type: Number,
                default: 0    
            },
            voters: [{
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                }
            }]
        },
        down: {
            count: {
                type: Number,
                default: 0    
            },
            voters: [{
                _id: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                }
            }]
        }
    },
    comments: [CommentSchema]
})


PostSchema.virtual('netVotes').get(function () {
    return this.votes.up - this.votes.down
})



const Post = mongoose.model('Post', PostSchema)

module.exports = Post