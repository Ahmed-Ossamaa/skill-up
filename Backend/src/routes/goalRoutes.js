const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { protect, isAdmin} = require('../middlewares/authMW');
const validate= require('../middlewares/reqValidation');
const { goalSchema, updateGoalSchema } = require('../Validation/goalValidation');

router.use(protect);


//===============================Admin Routes===================================
router.route('/all')
    .get(isAdmin,goalController.getAllGoals)

//===============================User Routes===================================
router.route('/')
    .get(goalController.getUserGoals)
    .post(validate(goalSchema),goalController.createGoal)

router.route('/:id')
    .get(goalController.getGoalById)
    .patch( validate(updateGoalSchema),goalController.updateGoal)
    .delete(goalController.deleteGoal);

module.exports = router;