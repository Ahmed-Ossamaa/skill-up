const Category = require('../models/Category');

class CategoryRepository {
    constructor() {
        this.Category = Category;
    }

    async find(query) {
        return this.Category.find(query).populate({
            path: 'subCategories',
            select: 'name description'
        });
    }

    async findById(id) {
        return this.Category.findById(id);
    }

    async create(data) {
        return this.Category.create(data);
    }

    async findByIdAndUpdate(id, data, options) {
        return this.Category.findByIdAndUpdate(id, data, options);
    }

    async findByIdAndDelete(id) {
        return this.Category.findByIdAndDelete(id);
    }
}

module.exports = new CategoryRepository();
