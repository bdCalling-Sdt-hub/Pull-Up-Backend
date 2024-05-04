const express = require('express')
const cors = require('cors');
const userRouter = require('./routes/userRouter');
const packageRouter = require('./routes/packageRouter');
const productRouter = require('./routes/productRouter');
const eventRouter = require('./routes/eventRouter');
const reviewRouter = require('./routes/reviewRouter');
const privacyRouter = require('./routes/privacyRouter');
const termsRouter = require('./routes/termsRouter');
const aboutRouter = require('./routes/aboutRouter');
const supportRouter = require('./routes/supportRouter');
const notificationRouter = require('./routes/notificationRouter');
const paymentRouter = require('./routes/paymentRouter');
const favoriteRouter = require('./routes/favoriteRouter');

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
        // [
        //   process.env.ALLOWED_CLIENT_URL_DASHBOARD,
        //   process.env.ALLOWED_CLIENT_URL_WEB,
        //   process.env.ALLOWED_CLIENT_URL_SUB_DASHBOARD
        // ],
        optionsSuccessStatus: 200
    }
));


// app.use(
//     cors({
//         origin: ["http://localhost:5173"],
//     })
// );


// //initilizing socketIO
// const http = require('http');
// const socketIo = require('socket.io');
// const server = http.createServer(app);
// const io = socketIo(server, {
//     cors: {
//         origin: "*"
//     }
// });

// const socketIO = require("./helpers/socketIO");
// socketIO(io);

// global.io = io

// const socketIOPort = process.env.SOCKET_IO_PORT
// server.listen(socketIOPort, () => {
//     console.log(`Server is listening on port: ${socketIOPort}`);
// });


//initilizing API routes
app.use('/api/users', userRouter);
app.use('/api/package', packageRouter);
app.use('/api/product', productRouter);
app.use('/api/event', eventRouter);
app.use('/api/review', reviewRouter);
app.use('/api/privacy', privacyRouter);
app.use('/api/terms', termsRouter);
app.use('/api/about', aboutRouter);
app.use('/api/support', supportRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/favorite', favoriteRouter);

//testing API is alive
app.get('/test', (req, res) => {
    res.send(req.t('Back-end is responding!!'))
})

//invalid route handler
app.use(notFoundHandler);
//error handling
app.use(globalErrorHandler)

module.exports = app;