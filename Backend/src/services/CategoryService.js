const ApiError = require('../utils/ApiError');
const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
    constructor() {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Fetch all categories with their subcategories.
     * @returns {Promise<[object]>} List of Main categories with their subcategories.
     */
    async getAllCategories() {
        const categories = await this.categoryRepository.find({ parent: null });
        return categories;
    }

    async getCategoryById(id) {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw ApiError.notFound('Category not found');
        return category;
    }

    async createCategory(data) {
        const category = await this.categoryRepository.create(data);
        return category;
    }

    async updateCategory(id, data) {
        const category = await this.categoryRepository.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!category) throw ApiError.notFound('Category not found');
        return category;
    }

    async deleteCategory(id) {
        const category = await this.categoryRepository.findByIdAndDelete(id);
        if (!category) throw ApiError.notFound('Category not found');
        return category;
    }
}

module.exports = CategoryService;
