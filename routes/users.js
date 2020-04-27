const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')


router.post('/users', async (req,res) => {
    // const token = jwt.sign({ token })
    let user = new User(req.body)
    try {
        const token = jwt.sign({_id: user._id}, 'mysupersecret', {expiresIn: '7 days'})
        user.tokens = [...user.tokens, token]
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        const token = jwt.sign({_id: user._id}, 'mysupersecret', {expiresIn: '7 days'})
        user.tokens = [...user.tokens, token]
        await user.save()
        res.send({user, token})

    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token !== req.token
        })
        await req.user.save()
        res.send('Successfully logged out!')
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        console.log(req.user)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router