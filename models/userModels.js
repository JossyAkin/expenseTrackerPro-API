const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'email is required'],
        validate:{
            validator:function(el){
                return validator.isEmail(el)
            },
            message:'mannn'
        }
    },
    password: {
        type: String,
        required: [true, 'please enter a password'],
        maxlength: [6, 'passwords must not be more than 6 characters'],
        select:false
    },
    confirmPassword: {
        type: String,
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'passwords are not the same'
        }

    },

    balance: {
        type: Number,
        required: [true, 'balance is required'],
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    passwordToken:String,
    passwordTokenExpires: Date
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
});

UserSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    return await bcrypt.compare(candidatePassword, userPassword)
}

UserSchema.methods.createPasswordReset = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
    //encrypt it in database
    this.passwordToken =crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.passwordTokenExpires = Date.now() + 10*60*1000;
    return resetToken
}

const User = mongoose.model('User', UserSchema);

module.exports = User;