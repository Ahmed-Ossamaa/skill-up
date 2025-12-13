const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const validate= require('../middlewares/reqValidation');
const { registerSchema, loginSchema , forgotSchema, resetSchema} = require('../Validation/usersValidation');
const { protect } = require('../middlewares/AuthMW');


router.post('/register', validate(registerSchema), auth.register);
router.post('/login', validate(loginSchema), auth.login);
router.post('/refresh',  auth.refresh);
router.post('/logout', protect, auth.logout);
router.post('/forgot-password' , validate(forgotSchema), auth.forgotPassword);
router.post('/reset-password',validate(resetSchema), auth.resetPassword);  


module.exports = router;