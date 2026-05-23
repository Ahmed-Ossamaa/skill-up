const express = require('express');
const router = express.Router();
const { userController } = require('../container');
const { protect, isAdmin } = require('../middlewares/AuthMW');
const { upload } = require('../middlewares/upload');
const validate = require('../middlewares/reqValidation');
const { updateUserSchema } = require('../Validation/usersValidation');

router.use(protect);

// ================== Admin Routes ==================
router.get('/', isAdmin, userController.getAllUsers);
router.delete('/delete/:id', isAdmin, userController.deleteUser);
router.get('/admin/stats', isAdmin, userController.getDashboardStats);
router.get('/admin/requests', isAdmin, userController.getAllRequests);
router.patch('/admin/review/:id/',isAdmin, userController.reviewRequest);

// ================== User Routes ==================
router.get('/me', userController.getUserById);
router.get('/:id', userController.getUserById);
router.patch('/me', validate(updateUserSchema), userController.updateUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.post('/instructor/request',
    upload.fields([
        { name: 'nationalId', maxCount: 1 },
        { name: 'certificate', maxCount: 1 },
        { name: 'resume', maxCount: 1 }
    ]),
    userController.requestInstructor);

module.exports = router;
