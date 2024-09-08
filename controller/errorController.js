const AppError = require('../utils/AppError');

const handleCastErrorDB = err => {
    const message = `Invalid value for ${err.path}: ${err.value}.`;
    return new AppError(message, 400);

};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/([""'])(\\?.)*?\1/)[0];
    console.log(value)
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

const sendErrorDev = (res, error) => {
    res.status(error.statusCode).json({
        status: error.status,
        error: error,
        message: error.message,
        stack: error.stack
    });
};

const sendErrorProd = (res, error) => {


    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message

        });

    }
    else {

        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
};

module.exports = (error, req, res, next) => {
    console.log(process.env.NODE_ENV)
    console.log(error)
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(res, error);

    }
    else if (process.env.NODE_ENV === 'production') {
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

        sendErrorProd(res, error);
    }
};
