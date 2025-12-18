import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InstructorStudents from "@/components/instructor/InstructorStudents";

export default function Page() {
    return (
        <DashboardLayout role="instructor">

            <div className="mb-10 max-w-6xl mx-auto">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    Student Insights
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Monitor student activity and course completion metrics.
                </p>
            </div>

            <InstructorStudents />

        </DashboardLayout>
    );
}