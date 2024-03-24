const app = require('./app');
require('dotenv').config();
// const port = process.env.PORT || 3001;

// app.get('/', (req, res) => {
//     res.send('Call Center Backend is Runinng!')
// })

// app.listen(port, () => {
//     console.log(`Call Center is listening on port ${port}`)
// })

const port = process.env.PORT || 3001;

const server = app.listen(port, process.env.API_SERVER_IP, () => {
    console.log(`Russend Server is listening on port: ${port}`)
});