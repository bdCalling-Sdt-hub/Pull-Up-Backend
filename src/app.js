const express = require('express')
const cors = require('cors');
const userRouter = require('./routes/userRouter');
const packageRouter = require('./routes/packageRouter');

const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const globalErrorHandler = require('./middlewares/GlobalErrorHanlder');
require('dotenv').config();
const app = express();

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_CONNECTION, {});
// console.log(process.env.MONGODB_CONNECTION)

//making public folder static for publicly access
app.use(express.static('public'));

// For handling form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Enable CORS
app.use(cors(
    {
        origin: "*",
        //[
        //   process.env.ALLOWED_CLIENT_URL_DASHBOARD,
        //   process.env.ALLOWED_CLIENT_URL_WEB,
        //   process.env.ALLOWED_CLIENT_URL_SUB_DASHBOARD
        // ],
        optionsSuccessStatus: 200
    }
));


//initilizing API routes
app.use('/api/users', userRouter);
app.use('/api/package', packageRouter);

//testing API is alive
app.get('/test', (req, res) => {
    res.send(req.t('Back-end is responding!!'))
})

//invalid route handler
app.use(notFoundHandler);
//error handling
app.use(globalErrorHandler)

module.exports = app;