const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50
    },
    message: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 200
    },
    userEmail: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, {timestamps: true});

module.exports = mongoose.model('FeedBack', feedBackSchema);