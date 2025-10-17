const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [ true, 'Title is required' ]
    },
    progress :{
        type: Number,
        min: [0,"Progress must be between 0 and 100"],
        max: [100,"Progress must be between 0 and 100"],
        default: 0
    },
    notes: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true});

module.exports = mongoose.model('Goal', goalSchema);