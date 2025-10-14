
class GoalService {
    constructor(GoalModel) {
        this.Goal = GoalModel;
    }

    async createGoal(userId, data) {
        const goal = await this.Goal.create({ ...data, user: userId });
        return goal;
    }

    async getUserGoals(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [goals, total] = await Promise.all([
            this.Goal.find({ user: userId }).skip(skip).limit(limit),
            this.Goal.countDocuments({ user: userId })
        ])

        return {
            total,  // total number of goals in DB
            page,   // current page number
            pages: Math.ceil(total / limit), // total pages
            count: goals.length,            // number of goals in this page
            data: goals                     // actual goal docs
        };
    }

    async getGoalById(goalId) {
        const goal = await this.Goal.findById(goalId);
        return goal;
    }

    async updateGoal(goalId, data) {
        const goal = await this.Goal.findByIdAndUpdate(goalId, data, { new: true });
        return goal;
    }

    async deleteGoal(goalId) {
        const goal = await this.Goal.findByIdAndDelete(goalId);
        return goal;
    }

    async getAllGoals(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [goals, total] = await Promise.all([
            this.Goal.find().skip(skip).limit(limit),
            this.Goal.countDocuments()
        ]);

        return {
            total,  // total number of goals in DB
            page,   // current page number
            pages: Math.ceil(total / limit), // total pages
            count: goals.length,            // number of goals in this page
            data: goals                     // actual goal docs
        };
    }
}

module.exports = GoalService;

