const express = require('express');
const router = express.Router();
const { authController } = require('../container');
const validate= require('../middlewares/reqValidation');
const { registerSchema, loginSchema , forgotSchema, resetSchema, changePasswordSchema} = require('../Validation/usersValidation');
const { protect } = require('../middlewares/AuthMW');


router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh',  authController.refresh);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password' , validate(forgotSchema), authController.forgotPassword);
router.post('/reset-password',validate(resetSchema), authController.resetPassword);  
router.post('/change-password', protect, validate(changePasswordSchema), authController.changePassword);


module.exports = router;