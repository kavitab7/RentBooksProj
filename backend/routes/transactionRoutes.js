const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction')
const User = require('../models/User');
const Book = require('../models/Book');

//Issue a book
router.post('/issue', async (req, res) => {
    try {
        const { bookName, userId, issueDate } = req.body
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        const transaction = new Transaction({
            bookName, userId, issueDate: new Date(issueDate),
        })
        await transaction.save();
        res.status(200).json({ message: 'Book issued successfully', transaction })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error occurred while issuing the book' });
    }
})

//Return a book
router.post('/return', async (req, res) => {
    try {
        const { bookName, userId, returnDate } = req.body
        const transaction = await Transaction.findOne({
            bookName, userId, returnDate: { $exists: false }
        })
        if (!transaction) {
            return res.status(404).json({ message: 'No transaction found' })
        }
        const issueDate = transaction.issueDate
        const rentDays = Math.ceil((new Date(returnDate) - issueDate) / (1000 * 3600 * 24))

        const book = await Book.findOne({ name: bookName });
        const totalRent = rentDays * book.rentPerDay;

        transaction.returnDate = new Date(returnDate);
        transaction.totalRent = totalRent
        await transaction.save()

        res.status(200).json({ message: 'Book returned successfully', totalRent })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error occurred while returning the book' })
    }
})

//Get users who issued book
router.get('/book-issuers', async (req, res) => {
    try {
        const { bookName } = req.query
        const transactions = await Transaction.find({ bookName }).populate('userId', 'name')
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found' })
        }
        const pastIssuers = transactions.map(transaction => ({
            userId: transaction.userId,
            issueDate: transaction.issueDate,
            returnDate: transaction.returnDate
        }))

        const currentTransaction = transactions.find(transaction => !transaction.returnDate);
        res.status(200).json({
            totalCount: pastIssuers.length,
            pastIssuers,
            currentlyIssued: currentTransaction ? currentTransaction.userId : 'Not issued at the moment'
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error occurred while fetching book issuers' });
    }
});

//Get total rent for book
router.get('/book-rent', async (req, res) => {
    try {
        const { bookName } = req.query

        const transactions = await Transaction.find({ bookName });

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No transactions found' })
        }

        const totalRent = transactions.reduce((sum, transaction) => sum + (transaction.totalRent || 0), 0)
        res.status(200).json({ bookName, totalRent })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while calculating total rent' });
    }
})

//Get books issued to a person 
router.get('/user-books', async (req, res) => {
    try {
        const { userId } = req.query

        const transactions = await Transaction.find({ userId })
        if (transactions.length === 0) {
            return res.status(404).json({ message: 'No books issued to this user' })
        }

        res.status(200).json({ booksIssued: transactions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while fetching books issued to the user' })
    }
})

//Get books issued in a data range
router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        const transactions = await Transaction.find({
            issueDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate('userId', 'name')

        if (transactions.length === 0) {
            return res.status(404).json({ message: 'books issued in the specified date range' })
        }
        res.status(200).json({ transactions });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error occurred while fetching books issued in date range' })
    }
})
module.exports = router;

