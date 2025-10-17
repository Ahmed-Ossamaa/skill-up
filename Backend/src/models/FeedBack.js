const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        minLength: [ 3, 'Subject must be at least 3 characters'],
        maxLength: [50, 'Subject must be at most 50 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        minLength: [10, 'Message must be at least 10 characters'],
        maxLength: [200, 'Message must be at most 200 characters']
    },
    userEmail: {
        type: String,
        required: [true, 'Email is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, {timestamps: true});

module.exports = mongoose.model('FeedBack', feedBackSchema);