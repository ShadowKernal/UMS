import DashboardLayout from '@/components/layout/DashboardLayout';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'UMS Dashboard',
    description: 'User Management System Dashboard',
};

// Use dynamic rendering since we are reading cookies/headers
export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    // Only pass serializable user data
    const simpleUser = {
        display_name: user.display_name,
        email: user.email
    };

    return (
        <DashboardLayout user={simpleUser}>
            {children}
        </DashboardLayout>
    );
}
