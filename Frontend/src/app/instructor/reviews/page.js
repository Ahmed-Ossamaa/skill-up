import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InstructorReviewFeed from "@/components/instructor/InstructorReviewFeed";


export default function Page() {
    return (

        <DashboardLayout role="instructor">
            <InstructorReviewFeed  />
        </DashboardLayout>
        
    );
}