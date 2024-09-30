const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    rentPerDay: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Book', bookSchema)