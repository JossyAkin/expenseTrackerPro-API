const express = require('express');

const router =  express.Router();

const {register, login, dashBoard, protect, forgotPassword, resetPassword} = require('../controller/authController');

router.post('/register', register)
router.post('/login', login)
router.post('/dashboard', protect, dashBoard)
router.post('/forgotpassword', forgotPassword)
router.patch('/resetpassword/:token', resetPassword)




module.exports = router;