const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true,
        minLenght: [3, 'Category name must be at least 3 characters'],
        maxLength: [50, 'Category name must be at most 50 characters']
    },
    description: {
        type: String,
        default: '',
        minLenght: [3, 'Description must be at least 3 characters'],
        maxLength: [200, 'Description must be at most 200 characters']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },

}, { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

categorySchema.virtual('subCategories', {
    ref: 'Category',      
    localField: '_id',    
    foreignField: 'parent'
});

module.exports = mongoose.model('Category', categorySchema);
