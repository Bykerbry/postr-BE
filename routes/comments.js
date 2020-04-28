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
        await post.save()
        res.send(post)

    } catch (e) {
        if(e.message === 'Post not found') {
            res.status(404).send({error: e.message})
        } else if(e.message === 'Unauthorized') {
            res.status(401).send({error: e.message})
        } else {
            res.status(500).send({error: e.message})
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
        if(e.message === 'Post not found') {
            res.status(404).send({error: e.message})
        } else if(e.message === 'Unauthorized') {
            res.status(401).send({error: e.message})
        } else {
            res.status(500).send({error: e.message})
        }
    }
})

module.exports = router