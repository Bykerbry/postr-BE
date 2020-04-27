const express = require('express')
const router = express.Router()
const Post = require('../models/posts')
const auth = require('../middleware/auth')

router.post('/posts', auth, async (req, res) => {
    const post = new Post(req.body)
    try {
        await post.save()
        res.send(post)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

module.exports = router