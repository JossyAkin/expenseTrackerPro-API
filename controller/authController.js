const User = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const transaction = require('../models/transactionModel');
const sendEmail = require('../utils/Email');
const crypto = require('crypto');
const Transaction = require('../models/transactionModel');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });
};

const register = catchAsync(async (req, res, next) => {
    const { name, email, password, confirmPassword, balance } = req.body;
    const newUser = await User.create({
        name: name,
        email: email,
        password: password,
        confirmPassword: confirmPassword,
        balance: balance
    });
    const token = signToken(newUser._id);

    await sendEmail({
        email: newUser.email,
        subject: "welcome to Expense Tracker PRO!",
        message: `<h3> Hey ${newUser.name}!<h5>
        <p> welcome to expense tracker pro,we are happy to have you here!<p> `
    });
    res.status(201).json({
        status: 'user succesfully registered',
        token,
        data: {
            newUser
        }
    });

});

const login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('please enter your email or password', 400));

    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('invalid email or password', 401));
    }
    const token = signToken(user._id);
    res.status(200).json({
        status: 'user logged in',
        token,
        data: {
            user
        }

    });

});

// auth middleware
const protect = catchAsync(async (req, res, next) => {
    // get token from headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(new AppError('you are not logged in, please log in', 401));
    }
    //verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('user for this token no longer exists', 401));
    }

    req.user = currentUser;
    next();
});

const dashBoard = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('name email balance');
    const transactions = await transaction.find({ user: req.user.id }).sort("-createdAt").limit(3);

    res.status(200).json({
        status: `welcome to your dashboard ${req.user.name}`,
        user,
        transactions
    });

});

const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        return next(new AppError('please provide your email!', 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new AppError('there is no user with that email', 401));
    }
    //create the random token
    const resetToken = user.createPasswordReset();
    await user.save({ validateBeforeSave: false });

    //send email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
    const message = `hello ${user.name} please use the url below to reset your password
    ${resetUrl} valid for only 10 minutes regards... ExpenseTrackerPRO`;
    try {
        await sendEmail({
            email: user.email,
            subject: "your password reset token(exires in 10 minutes)",
            message,
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent via email!'

        });
    } catch (err) {
        user.passwordToken = undefined;
        user.passwordTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('there was an error sending the email please try again later', 500));
    }

});

const resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({ passwordToken: hashedToken, passwordTokenExpires: { $gt: Date.now() } });
    //update password
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordToken = undefined;
    user.passwordTokenExpires = undefined;
    await user.save();
    const token = signToken(user._id);

    res.status(200).json({
        status: 'password succesfully changed!',
        token

    });

});


module.exports = {
    register,
    login,
    dashBoard,
    protect,
    forgotPassword,
    resetPassword,
    
};