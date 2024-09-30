const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./dbConnection');
const bookRoutes = require('./routes/bookRoutes');
const transactionRoutes = require('./routes/transactionRoutes')
const userRoutes = require('./routes/userRoutes')

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send('Project is running...');
});

//Api routes
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/transactions', transactionRoutes)
app.use('/api/v1/users', userRoutes)


const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})