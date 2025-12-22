const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/AuthMW');
const validate  = require('../middlewares/reqValidation');
const { updateUserSchema } = require('../Validation/usersValidation');

router.use(protect);

// ================== Admin Routes ==================
router.get('/', isAdmin, userController.getAllUsers);
router.delete('/delete/:id', isAdmin, userController.deleteUser);
router.get('/admin/stats',isAdmin, userController.getDashboardStats);

// ================== User Routes ==================
router.get('/me', userController.getUserById);
router.get('/:id', userController.getUserById);
router.patch('/me', validate(updateUserSchema), userController.updateUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);

module.exports = router;
