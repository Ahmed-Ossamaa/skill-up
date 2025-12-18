import DashboardLayout from "@/components/dashboard/DashboardLayout";




export default function Page() {
    return (
        <>
            <DashboardLayout role="instructor">

            <div className="container mx-auto px-4 py-8 ">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">My Profile</h1>
            </div>

            </DashboardLayout>
        </>
    );
}