
class GoalService{  
    constructor(GoalModel) {
        this.Goal = GoalModel;
    }

    async  createGoal ( userId, data ) {
        const goal = await this.Goal.create({ ...data, user: userId });
        return goal;
    }

    async getUserGoals ( userId ) {
        const goals = await this.Goal.find({ user: userId });
        return goals;
    }

    async getGoalById ( goalId ) {
        const goal = await this.Goal.findById(goalId);
        return goal;
    }

    async updateGoal ( goalId, data ) {
        const goal = await this.Goal.findByIdAndUpdate(goalId, data, { new: true });
        return goal;
    }

    async deleteGoal ( goalId ) {
        const goal = await this.Goal.findByIdAndDelete(goalId);
        return goal;
    }

    async getAllGoals () {
        const goals = await this.Goal.find();
        return goals;
    }
}

module.exports = GoalService;