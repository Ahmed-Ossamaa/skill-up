const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const validate= require('../middlewares/reqValidation');
const { registerSchema, loginSchema } = require('../Validation/usersValidation');


router.post('/register', validate(registerSchema), auth.register);
router.post('/login', validate(loginSchema), auth.login);

module.exports = router;