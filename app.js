const express = require('express');
const cors = require('cors');
const globalErrorHandler = require('./controller/errorController');
const AppError= require('./utils/AppError');
const UserRouter = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
app.use(cors());

app.use(express.json());
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/transactions', transactionRoutes);





app.use('*', (req, res, next)=>{
    return next(new AppError(`cant find ${req.originalUrl} on this server!`, 404))
    
})
app.use(globalErrorHandler)
module.exports = app;