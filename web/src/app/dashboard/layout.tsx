import DashboardLayout from '@/components/layout/DashboardLayout';
import { getCurrentUserWithRoles } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from '@/lib/constants';

export const metadata = {
    title: 'UMS Dashboard',
    description: 'User Management System Dashboard',
};

// Use dynamic rendering since we are reading cookies/headers
export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const user = await getCurrentUserWithRoles();

    if (!user) {
        redirect('/login');
    }

    if (!user.roles.includes(ROLE_ADMIN) && !user.roles.includes(ROLE_SUPER_ADMIN)) {
        redirect('/account');
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
