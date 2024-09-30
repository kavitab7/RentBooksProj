const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
    bookName: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    totalRent: {
        type: Number
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);