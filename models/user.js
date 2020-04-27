const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')


const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        maxlength: 200,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        type: String,
        required: true
    }]
})

UserSchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        console.log('password was modified. - UserSchema');
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

UserSchema.statics.validateLogin = async (email, password) => {
    const user = await User.findOne({email})
    if(!user) {
        throw new Error('Invalid Login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Invalid Login')
    }
    return user
}


const User = mongoose.model('User', UserSchema)

module.exports = User
