import DashboardLayout from '@/components/DashboardLayout';
import Navbar from '@/components/Navbar';

export default function Layout({ children }) {
    return (
        <DashboardLayout>
            <div className="flex flex-col h-full">
                <Navbar role="user" />
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </DashboardLayout>
    );
}
