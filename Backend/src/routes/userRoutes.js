const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/authMW');
const validate= require('../middlewares/reqValidation');
const { updateUserSchema } = require('../Validation/usersValidation');

router.use(protect);

router.get('/', isAdmin,user.getAllUsers);
router.delete('/:id',isAdmin ,user.deleteUser);
router.get('/:id', user.getUserById);
router.patch('/:id',validate(updateUserSchema),user.updateUser);

module.exports = router;