const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    name: {
        type: String,
        required: function () { return !this.user; }
    },

    email: {
        type: String,
        required: function () { return !this.user; }
    },

    subject: {
        type: String,
        default: 'General Feedback',
        minLength: [3, 'Subject must be at least 3 characters'],
        maxLength: [50, 'Subject must be at most 50 characters']
    },

    message: {
        type: String,
        required: [true, 'Message is required'],
        minLength: [10, 'Message must be at least 10 characters'],
        maxLength: [1000, 'Message must be at most 1000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied'],
        default: 'new'
    },

}, { timestamps: true });

module.exports = mongoose.model('FeedBack', feedBackSchema);