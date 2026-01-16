export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <main className="max-w-7xl mx-auto p-4 lg:p-8 min-h-screen">
                {children}
            </main>
        </div>
    );
}
