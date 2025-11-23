const ApiError = require('../utils/ApiError');

class CategoryService {
    constructor(CategoryModel) {
        this.Category = CategoryModel;
    }

    async getAllCategories() {
        return await this.Category.find();
    }

    async getCategoryById(id) {
        const category = await this.Category.findById(id);
        if (!category) throw ApiError.notFound('Category not found');
        return category;
    }

    async createCategory(data) {
        const category = await this.Category.create(data);
        return category;
    }

    async updateCategory(id, data) {
        const category = await this.Category.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!category) throw ApiError.notFound('Category not found');
        return category;
    }

    async deleteCategory(id) {
        const category = await this.Category.findByIdAndDelete(id);
        if (!category) throw ApiError.notFound('Category not found');
        return category;
    }
}

module.exports = CategoryService;
