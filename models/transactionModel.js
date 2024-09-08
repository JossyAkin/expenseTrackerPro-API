const mongoose = require('mongoose');
const validator = require('validator');
const transactionSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required :true,
    },
    amount:{
        type:Number,
        required:true,
        min:[0, 'amount cannot be less than 0'],
        validate:{
            validator:function(el){
                return validator.isNumeric(el.toString())
            },
            message:'please enter a valid number!'
        }
    },
    transaction_type:{
        type:String,
        required:true,
        enum :['income', 'expenses'],
    },
    remarks:{
        type:String,
        required:true,
        minlength: [6, 'transaction must be more than 6 characters long!'],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});


const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;