const express = require('express')
const router = express.Router()
const Post = require('../models/posts')
const auth = require('../middleware/auth')

router.post('/posts', auth, async (req, res) => {
    req.body.creator = {
        _id: req.user._id,
        name: `${req.user.firstName} ${req.user.lastName}`
    }
    req.body.createdAt = new Date()

    const post = new Post(req.body)

    try {
        await post.save()
        res.send(post)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/posts/me', auth, async (req,res) => {
    try {
        const posts = await Post.find({"creator._id": req.user._id})
        res.send(posts)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/posts/all', auth, async (req, res) => {
    try {
        const posts = await Post.find({})
        res.send(posts)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/posts/update/:id', auth, async (req, res) => {
    const allowedUpdates = ['title', 'body']
    const updates = Object.keys(req.body)
    const isValid = updates.every(update => allowedUpdates.includes(update))

    try {
        const post = await Post.findById(req.params.id).orFail(new Error('Post not found'))

        if(!isValid) {
            throw new Error('Invalid update request')
        }
        if (post.creator._id.equals(req.user._id)) {
            updates.forEach(update => post[update] = req.body[update])
            post.lastUpdatedAt = new Date()
            await post.save()
            res.send(post)
        } else {
            throw new Error('Unauthorized update')
        }
    } catch (e) {
        if(e.message === 'Unauthorized update') {
            res.status(401).send({error: e.message})
        } else if (e.message === 'Post not found') {
            res.status(404).send({error: e.message})
        } else {
            res.status(400).send({error: e.message})
        }
    }
})

router.delete('/posts/delete/:id', auth, async (req, res) => {
    try {
        console.log(req.params.id);
        const post = await Post.findById(req.params.id).orFail(new Error('Post not found'))
        console.log(post);
        if (req.user._id.equals(post.creator._id)) {
            await Post.deleteOne({_id: req.params.id})
            res.send()
        } else {
            throw new Error('Unauthorized')
        }
    } catch (e) {
        if (e.message === 'Post not found') {
            res.status(404).send({error: e.message})
        } else if (e.message === 'Unauthorized') {
            res.status(401).send({error: e.message})
        } else {
            res.status(500).send({error: e.message})
        }
    }
})



module.exports = router