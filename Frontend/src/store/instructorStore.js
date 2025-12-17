import { create } from 'zustand';
import { instructorAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export const useInstructorStore = create((set) => ({
    stats: {
        courses: 0,
        students: 0,
        revenue: 0,
        rating: 0,
        revenueTrend: "0%",
        revenueTrendDir: "up",
        studentTrend: "0%",
        studentTrendDir: "up"
    },
    chartData: [],
    coursePerformance: [],
    loading: false,

    fetchDashboardData: async () => {
        set({ loading: true });
        try {
            const { data } = await instructorAPI.getInstructorDashboard();
            set({
                stats: data.data.stats,
                chartData: data.data.chartData,
                coursePerformance: data.data.coursePerformance,
                loading: false
            });
        } catch (error) {
            toast.error("Failed to load dashboard metrics");
            set({ loading: false });
        }
    }
}));