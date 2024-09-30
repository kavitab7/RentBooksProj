const express = require('express');
const router = express.Router();
const Book = require('../models/Book')

//Create a book
router.post('/', async (req, res) => {
    try {
        const { name, category, rentPerDay } = req.body

        const existingBook = await Book.findOne({ name });
        if (existingBook) {
            return res.status(400).json({ message: 'Book with this name already exists' })
        }

        const newBook = new Book({
            name, category, rentPerDay
        });
        await newBook.save();
        res.status(201).json({ message: 'Book created successfully', newBook })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error occurred while creating the book' });
    }
})

//Get all books
router.get('/all-books', async (req, res) => {
    try {
        const books = await Book.find()
        res.status(200).json(books);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while fetching books' })
    }
})

// Get books by name or term
router.get('/search-book', async (req, res) => {
    try {
        const { term } = req.query
        const books = await Book.find({ name: { $regex: term, $options: 'i' } })
        if (books.length == 0) {
            return res.status(404).json({ message: 'No search results' })
        }

        res.status(200).json(books);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while fetching books' })
    }
})

//Get books by rent range
router.get('/rent-range', async (req, res) => {
    try {
        const { minRent, maxRent } = req.query
        if (!minRent || !maxRent) {
            return res.status(400).json({ message: 'Please provide both minRent and maxRent' })
        }
        const books = await Book.find({
            rentPerDay: { $gte: Number(minRent), $lte: Number(maxRent) }
        })
        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found within the rent range' })
        }

        res.status(200).json(books)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error in range' })
    }
})

//Get books by category, name and rent range
router.get('/filter', async (req, res) => {
    try {
        const { category, term, minRent, maxRent } = req.query
        const books = await Book.find({
            category,
            name: { $regex: term, $options: 'i' },
            rentPerDay: { $gte: Number(minRent), $lte: Number(maxRent) }
        })

        if (books.length === 0) {
            return res.status(404).json({ message: 'No books found' })
        }
        res.status(200).json(books)
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error while filtering books' })
    }
})

module.exports = router;

