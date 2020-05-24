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
                name: req.user.fullName,
                profilePicture: req.user.profilePicture
            },
            createdAt: Date.now()
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
        post.comments[index].lastUpdatedAt = Date.now()
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

router.patch('/posts/comments/cast/:vote/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({"comments._id": req.params.id}).orFail(new Error('Post not found'))

        const index = post.comments.findIndex(comment => comment._id.equals(req.params.id))

        if (post.comments[index].creator._id.equals(req.user._id)) {
            throw new Error('Unauthorized')
        }

        switch(req.params.vote) {
            case 'up': 
                post.comments[index].votes.up.count++
                post.comments[index].votes.up.voters = [...post.comments[index].votes.up.voters, {
                    _id: req.user._id,
                    name: req.user.fullName
                }]
                break;
            case 'down':
                post.comments[index].votes.down.count++
                post.comments[index].votes.down.voters = [...post.comments[index].votes.down.voters, {
                    _id: req.user._id,
                    name: req.user.fullName
                }]
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

router.patch('/posts/comments/remove/:vote/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({"comments._id": req.params.id}).orFail(new Error('Post not found'))

        const index = post.comments.findIndex(comment => comment._id.equals(req.params.id))

        if (index < 0) {
            throw new Error('Comment not found')
        }

        const findVoterIndex = (vote) => {
            return vote.voters.findIndex(voter => voter._id.equals(req.user._id))
        }

        const removeVoter = (vote, voterIndex) => {
            return [
                ...vote.voters.slice(0, voterIndex),
                ...vote.voters.slice(voterIndex + 1)
            ]
        }

        switch(req.params.vote) {
            case 'up':
                const { up } = post.comments[index].votes
                const upVoterIndex = findVoterIndex(up)
                if (upVoterIndex >= 0) {
                    up.voters = removeVoter(up, upVoterIndex)
                    up.count--
                }
                break;
            case 'down':
                const { down } = post.comments[index].votes
                const downVoterIndex = findVoterIndex(down)
                if (downVoterIndex >= 0) {
                    down.voters = removeVoter(down, downVoterIndex)
                    down.count--
                }
                break;
            default:
                throw new Error ('Invalid request')
        }
        console.log(post.comments[index])
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
            case 'Comment not found':
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