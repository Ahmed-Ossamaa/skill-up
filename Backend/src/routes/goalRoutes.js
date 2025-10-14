const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { protect, isAdmin} = require('../middlewares/authMW');

router.use(protect);


//===============================Admin Routes===================================
router.route('/all')
    .get(isAdmin,goalController.getAllGoals)

//===============================User Routes===================================
router.route('/')
    .get(goalController.getUserGoals)
    .post(goalController.createGoal)

router.route('/:id')
    .get(goalController.getGoalById)
    .patch(goalController.updateGoal)
    .delete(goalController.deleteGoal);

module.exports = router;