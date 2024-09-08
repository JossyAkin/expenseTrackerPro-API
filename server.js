const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
    .then(() => {
        console.log('CONNECTED TO DATABASE!');
    }).catch((err) => {
        console.log('COULD NOT CONNECT TO DATABASE', err);
    });



app.listen(3000, () => {
    console.log('server is listening on port : 3000');
})

