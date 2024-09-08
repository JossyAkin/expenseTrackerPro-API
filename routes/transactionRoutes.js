const express = require('express');

const router = express.Router();

const {addIncome, addExpenses, getTransactions, editTransaction, deleteTransaction} = require('../controller/transactionController');
const {protect} = require('../controller/authController')

router.post('/addIncome', protect, addIncome);
router.post('/addExpenses', protect, addExpenses);
router.get('/', protect, getTransactions);
router.patch('/editTransaction/:transaction_id', protect, editTransaction);
router.delete('/deleteTransaction/:transaction_id',protect, deleteTransaction);




module.exports = router;