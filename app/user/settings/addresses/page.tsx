import Link from 'next/link';
import { redirect } from 'next/navigation';
import Logo from '@/components/Logo';
import { getAuthSession } from '@/app/auth/actions';
import { getSavedAddresses } from './actions';
import AddressBookClient from './AddressBookClient';
import { getAccountHomeHref, isCustomerRole } from '@/lib/account-routing';

export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
    const { isAuth, userId, role } = await getAuthSession();
    if (!isAuth || !userId) redirect('/login');
    if (!isCustomerRole(role)) redirect(getAccountHomeHref(role));

    const savedAddresses = await getSavedAddresses(userId);

    return (
        <div className="food-app-shell">
            <nav className="food-app-nav">
                <div
                    className="mx-auto flex items-center justify-between px-4 sm:px-0"
                    style={{ width: 'min(1180px, calc(100% - 32px))', padding: '14px 0' }}
                >
                    <Logo size="sm" />
                    <Link href="/user/settings" className="btn btn-ghost">
                        ← Back to Settings
                    </Link>
                </div>
            </nav>

            <main className="food-app-main">
                <section className="food-panel">
                    <p className="food-kicker mb-3">Delivery</p>
                    <h1 className="food-heading">Address Book</h1>
                    <p className="food-subtitle mt-3 !max-w-none">
                        Save multiple delivery addresses and set a default for faster checkout on every order.
                    </p>
                </section>

                <section className="mt-8 food-panel">
                    <AddressBookClient
                        userId={userId}
                        initialAddresses={savedAddresses}
                    />
                </section>
            </main>
        </div>
    );
}
