const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize, isAdmin } = require('../middlewares/AuthMW');
const validate  = require('../middlewares/reqValidation');
const { createCategorySchema, updateCategorySchema } = require('../Validation/categoryValidation');
const {objIdSchema} = require('../Validation/objectIdValidation');

// ---------------- Public ----------------
router.get('/', categoryController.getAllCategories);
router.get('/:id', validate(objIdSchema, 'params'), categoryController.getCategoryById);

// ---------------- Protected (Admin Only) ----------------
router.use(protect, isAdmin);

router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', validate(objIdSchema, 'params'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', validate(objIdSchema, 'params'), categoryController.deleteCategory);

module.exports = router;
