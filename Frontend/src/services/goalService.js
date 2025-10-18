import axiosInstance from "../api/api";

export const goalServices = {
    createGoal: async (goal) => {
        const res = await axiosInstance.post('goals/', goal);
        return res.data;
    },
    getGoals: async () => {
        const res = await axiosInstance.get('goals');
        return res.data;
    },
    getGoalById: async (id) => {
        const res = await axiosInstance.get(`goals/${id}`);
        return res.data;

    },
    updateGoal: async (id, goal) => {
        const res = await axiosInstance.patch(`goals/${id}`, goal);
        return res.data;
    },
    deleteGoal: async (id) => {
        const res = await axiosInstance.delete(`goals/${id}`);
        return res.data;
    },
    getAllGoals: async () => {//admin
        const res = await axiosInstance.get('goals/all');
        return res.data;
    },
}