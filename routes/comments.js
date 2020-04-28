const express = require('express')
const router = express.Router()
const Post = require('../models/posts')
const auth = require('../middleware/auth')

router.post('/posts/comments/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        post.comments = [...post.comments, {
            comment: req.body.comment,
            creator: {
                _id: req.user._id,
                name: req.user.fullName
            },
            createdAt: new Date()
        }]
        await post.save()
        res.status(201).send(post)
    } catch (e) {
        console.log(e);
        res.status(400).send({error: e.message})
    }
})

router.patch('/posts/comments/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({"comments._id": req.params.id}).orFail(new Error('Post not found'))
     
        if (!post.creator._id.equals(req.user._id)) {
            throw new Error('Unauthorized')
        }

        const index = post.comments.findIndex(comment => comment._id.equals(req.params.id))
        post.comments[index].comment = req.body.comment
        post.comments[index].lastUpdatedAt = new Date()
        await post.save()
        res.send(post)

    } catch (e) {
        const err = {error: e.message}
        switch(e.message) {
            case 'Unauthorized':
                res.status(401).send(err)
            case 'Post not found':
                res.status(404).send(err)
            default:
                res.status(500).send(err)
        }
    }
})

router.patch('/posts/comments/:vote/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({"comments._id": req.params.id}).orFail(new Error('Post not found'))

        if (post.creator._id.equals(req.user._id)) {
            throw new Error('Unauthorized')
        }

        const index = post.comments.findIndex(comment => comment._id.equals(req.params.id))
        switch(req.params.vote) {
            case 'up': 
                post.comments[index].votes.up++
                break;
            case 'down':
                post.comments[index].votes.down++
                break;
            default:
                throw new Error ('Invalid request')
        }

        await post.save()
        res.status(201).send(post)
    } catch (e) {
        const err = {error: e.message}
        switch(e.message) {
            case 'Invalid request':
                res.status(400).send(err)
            case 'Unauthorized':
                res.status(401).send(err)
            case 'Post not found':
                res.status(404).send(err)
            default:
                res.status(500).send(err)
        }
    }
})

router.delete('/posts/comments/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findOne({"comments._id": req.params.id}).orFail(new Error('Post not found'))
        
        if (!post.creator._id.equals(req.user._id)) {
            throw new Error('Unauthorized')
        }

        const commentIndex = post.comments.findIndex(comment => comment._id.equals(req.params.id))
        post.comments.splice(commentIndex, 1)
        await post.save()
        res.send(post)

    } catch (e) {
        const err = {error: e.message}
        switch(e.message) {
            case 'Unauthorized':
                res.status(401).send(err)
            case 'Post not found':
                res.status(404).send(err)
            default:
                res.status(500).send(err)
        }
    }
})

module.exports = router