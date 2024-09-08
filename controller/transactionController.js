const Transaction = require('../models/transactionModel');
const User = require('../models/userModels');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const addIncome = catchAsync(async (req, res, next) => {

    await Transaction.create({
        user: req.user.id,
        amount: req.body.amount,
        remarks: req.body.remarks,
        transaction_type: 'income'
    });


    await User.updateOne({ _id: req.user.id }, { $inc: { balance: req.body.amount } }, {
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        message: 'income added succesfully',

    });

});


const addExpenses = catchAsync(async (req, res, next) => {

    await Transaction.create({
        user: req.user.id,
        amount: req.body.amount,
        remarks: req.body.remarks,
        transaction_type: 'expenses'
    });


    await User.updateOne({ _id: req.user.id }, { $inc: { balance: req.body.amount * -1 } }, {
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        message: 'expenses added succesfully',

    });

});

const getTransactions = catchAsync(async (req, res, next) => {
    const transactions = await Transaction.find({ user: req.user.id, ...req.query });
    res.status(200).json({
        status: 'Transactions',
        transactions

    });

});


const editTransaction = catchAsync(async (req, res, next) => {
    const { transaction_id } = req.params;
    const transaction = await Transaction.findOne({ _id: transaction_id });
    if (!transaction) {
        return next(new AppError('there is no transaction with that ID', 400));
    }
    const { remarks } = req.body;

    const updated = await Transaction.updateOne({ _id: transaction_id },
        {
            remarks
        },
        {
            new: true,
            runValidators: true
        }
    );
    res.status(200).json({
        status: 'transaction succesfully updated!',

    });

});

const deleteTransaction = catchAsync(async (req, res, next) => {
    const {transaction_id} = req.params

    const transaction = await Transaction.findOne({ _id: transaction_id });
    if (!transaction) {
        return next(new AppError('there is no transaction with that ID', 400));
    }

    if (transaction.transaction_type === 'income') {
        await User.updateOne({
            _id: req.user.id
        },{
            $inc:{
                balance:transaction.amount*-1
            }
        },{
            new:true,
            runValidatators:true
        });
    }
    else {
        await User.updateOne({
            _id: req.user.id
        }, {
            $inc: {
                balance: transaction.amount,
            }
        },{
            new:true,
            runValidatators:true
        });
    }

    await Transaction.deleteOne({
        _id:transaction_id
    })


    res.status(204).json({
        status:'transaction succesfully deleted!'
    })
     
})





module.exports = {
    addIncome,
    addExpenses,
    getTransactions,
    editTransaction,
    deleteTransaction
};