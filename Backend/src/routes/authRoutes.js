const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const validate= require('../middlewares/reqValidation');
const { registerSchema, loginSchema } = require('../Validation/usersValidation');
const { protect } = require('../middlewares/authMW');


router.post('/register', validate(registerSchema), auth.register);
router.post('/login', validate(loginSchema), auth.login);
router.post('/logout', protect, auth.logout);

module.exports = router;