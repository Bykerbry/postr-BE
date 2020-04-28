const express = require('express')
const router = express.Router()
const Post = require('../models/posts')
const auth = require('../middleware/auth')

router.post('/posts', auth, async (req, res) => {
    req.body.creator = {
        _id: req.user._id,
        name: req.user.fullName
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
            throw new Error('Invalid request')
        }
        if (post.creator._id.equals(req.user._id)) {
            updates.forEach(update => post[update] = req.body[update])
            post.lastUpdatedAt = new Date()
            await post.save()
            res.send(post)
        } else {
            throw new Error('Unauthorized')
        }
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

router.delete('/posts/delete/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).orFail(new Error('Post not found'))

        if (req.user._id.equals(post.creator._id)) {
            await Post.deleteOne({_id: req.params.id})
            res.send()
        } else {
            throw new Error('Unauthorized')
        }
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

router.patch('/posts/:vote/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).orFail(new Error('Post not found'))

        if (post.creator._id.equals(req.user._id)) {
            throw new Error('Unauthorized')
        }

        switch(req.params.vote) {
            case 'up': 
                post.votes.up++
                break;
            case 'down':
                post.votes.down++
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



module.exports = router