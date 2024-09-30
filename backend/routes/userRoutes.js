const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users);

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error occurred while fetching users' })
    }
})

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email } = req.body;

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const newUser = new User({ name, email })
        await newUser.save()

        res.status(201).json({ message: 'User created successfully', newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error occurred while creating user' });
    }
});

module.exports = router