const CategoryService = require('../services/CategoryService');
const asyncHandler = require('express-async-handler');

class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
    }

    getAllCategories = asyncHandler(async (req, res) => {
        const categories = await this.categoryService.getAllCategories();
        res.status(200).json({ data: categories });
    });

    getCategoryById = asyncHandler(async (req, res) => {
        const category = await this.categoryService.getCategoryById(req.params.id);
        res.status(200).json({ data: category });
    });

    createCategory = asyncHandler(async (req, res) => {
        const category = await this.categoryService.createCategory(req.body);
        res.status(201).json({ message: 'Category created', data: category });
    });

    updateCategory = asyncHandler(async (req, res) => {
        const category = await this.categoryService.updateCategory(req.params.id, req.body);
        res.status(200).json({ message: 'Category updated', data: category });
    });

    deleteCategory = asyncHandler(async (req, res) => {
        await this.categoryService.deleteCategory(req.params.id);
        res.status(200).json({ message: 'Category deleted' });
    });
}

module.exports = new CategoryController();
