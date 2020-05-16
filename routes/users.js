const express = require('express')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname)
    }
})

const upload = multer({ 
    storage, 
    limits: { 
        fileSize: 1024 * 1024 * 5
    },
    fileFilter(req,file,cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be of type jpg, jpeg, or png'))
        }
        cb(null, true)
    }
})


router.post('/users', async (req,res) => {
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
    console.log(req.body)
    try {
        const user = await User.validateLogin(req.body.email, req.body.password)
        const token = jwt.sign({_id: user._id}, 'mysupersecret', {expiresIn: '7 days'})
        user.tokens = [...user.tokens, token]
        await user.save()
        res.send({user, token})
    } catch (e) {
        res.status(400).send({error: e.message})
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
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/users/me/update', auth, async (req, res) => {
    const allowedUpdates =['firstName', 'lastName', 'email', 'password']
    const updates = Object.keys(req.body)
    const isValid = updates.every(update => allowedUpdates.includes(update))

    try {
        if (!isValid) {
            throw new Error('Invalid request')
        }
        const user = req.user
        updates.forEach(update => user[update] = req.body[update])    
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send({error: e.message})
    }
})
router.post('/users/me/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        req.user.profilePicture = req.file.filename
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send({error: e.message})
    }
})


module.exports = router