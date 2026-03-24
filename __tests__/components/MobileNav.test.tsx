import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import MobileNav from '@/components/MobileNav';
import { usePathname } from 'next/navigation';

// Mock usePathname
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('MobileNav Component', () => {
    beforeEach(() => {
        (usePathname as jest.Mock).mockReturnValue('/restaurants');
    });

    it('hides completely on blacklisted routes (e.g. /login)', () => {
        (usePathname as jest.Mock).mockReturnValue('/login');
        const { container } = render(<MobileNav />);
        expect(container.firstChild).toBeNull();
    });

    it('renders Driver Navigation when pathname starts with /driver/dashboard', () => {
        (usePathname as jest.Mock).mockReturnValue('/driver/dashboard');
        render(<MobileNav role="DRIVER" />);
        
        // Driver specific navigation
        expect(screen.getByText('Board')).toBeInTheDocument();
        expect(screen.getByText('Trips')).toBeInTheDocument();
        expect(screen.getByText('Pay')).toBeInTheDocument();
        expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('renders Merchant Navigation when pathname starts with /merchant/dashboard', () => {
        (usePathname as jest.Mock).mockReturnValue('/merchant/dashboard');
        render(<MobileNav role="MERCHANT" />);
        
        // Merchant specific navigation
        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('Menu')).toBeInTheDocument();
    });

    it('renders Default Customer Navigation on standard routes', () => {
        (usePathname as jest.Mock).mockReturnValue('/restaurants');
        render(<MobileNav />);
        
        // Expect customer tabs to be visible
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Search')).toBeInTheDocument();
        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('defaults to Customer Navigation if no role is explicitly passed', () => {
        render(<MobileNav />);
        // It should still default to customer links if navigating normal app routes
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });
});
