const express = require('express');
const router = express.Router();
const user = require('../controllers/userController');
const { protect, isAdmin } = require('../middlewares/authMW');

router.use(protect);

router.get('/', isAdmin,user.getAllUsers);
router.delete('/:id',isAdmin ,user.deleteUser);
router.get('/:id', user.getUserById);
router.patch('/:id', user.updateUser);

module.exports = router;