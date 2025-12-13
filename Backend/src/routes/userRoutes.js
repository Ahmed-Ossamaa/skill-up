const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/AuthMW');
const validate  = require('../middlewares/reqValidation');
const { updateUserSchema } = require('../Validation/usersValidation');
const { objIdSchema } = require('../Validation/objectIdValidation');

router.use(protect);

// ================== Admin Routes ==================
router.get('/', isAdmin, userController.getAllUsers);
router.delete('/:id', isAdmin, validate(objIdSchema, 'params'), userController.deleteUser);

// ================== User Routes ==================
router.get('/:id', validate(objIdSchema, 'params'), userController.getUserById);
router.patch('/:id', validate(objIdSchema, 'params'), validate(updateUserSchema), userController.updateUser);

module.exports = router;
