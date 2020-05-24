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
        }, 
        profilePicture: {
            type: String
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
})


module.exports = CommentSchema