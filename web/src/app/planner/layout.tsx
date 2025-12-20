import PlannerNavbar from '@/components/layout/PlannerNavbar';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';


export const metadata = {
    title: 'PrepMaster | My Plan',
    description: 'Weekly meal planning made simple.',
};

// Use dynamic rendering since we are reading cookies/headers
export const dynamic = 'force-dynamic';

export default async function PlannerLayout({ children }: { children: React.ReactNode }) {
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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <PlannerNavbar user={simpleUser} />
            <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
                {children}
            </main>
        </div>
    );
}
