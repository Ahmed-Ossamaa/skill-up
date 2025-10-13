const Goal = require('../models/Goal');
const GoalService = require('../services/GoalService');
const asyncHandler = require('express-async-handler');

class GoalController {
    constructor() {
        this.goalService = new GoalService(Goal);
    }

    createGoal = asyncHandler(async (req, res) => {
        const userId = req.user.id; 
        const goalData = req.body;

        if (!goalData || Object.keys(goalData).length === 0) {
            res.status(400);
            throw new Error('Goal data is required');
        }

        const goal = await this.goalService.createGoal(userId, goalData);
        console.log(userId);
        console.log('request : ', req);
        console.log('request.user : ', req.user );

        res.status(201).json(goal);
    });

    getUserGoals = asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const goals = await this.goalService.getUserGoals(userId);

        res.status(200).json({
            count: goals.length,
            data: goals
        });
    });

    getGoalById = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const goal = await this.goalService.getGoalById(id);

        if (!goal) {
            res.status(404);
            throw new Error('Goal not found');
        }

        //only the user who created the goal can display it or admin
        if (goal.user.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to access this goal');
        }

        res.status(200).json(goal);
    });

    updateGoal = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const updateGoal = req.body;

        if (!updateGoal || Object.keys(updateGoal).length === 0) {
            res.status(400);
            throw new Error('You must provide goal data to update');
        }

        const existingGoal = await this.goalService.getGoalById(id);

        if (!existingGoal) {
            res.status(404);
            throw new Error('Goal not found');
        }
        //only the user who created the goal can update it
        if (existingGoal.user.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Not authorized to update this goal');
        }

        const goal = await this.goalService.updateGoal(id, updateGoal);

        res.status(200).json(goal);
    });

    deleteGoal = asyncHandler(async (req, res) => {
        const { id } = req.params;

        const existingGoal = await this.goalService.getGoalById(id);

        if (!existingGoal) {
            res.status(404);
            throw new Error('Goal not found');
        }
        //only the user who created the goal can delete it or admin
        if (existingGoal.user.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this goal');
        }

        await this.goalService.deleteGoal(id);

        res.status(200).json({ message: 'Goal deleted successfully'});
    });

    getAllGoals = asyncHandler(async (req, res) => {
        const goals = await this.goalService.getAllGoals();
        res.status(200).json({
            count: goals.length,
            data: goals
        });
    });
}

module.exports = new GoalController();