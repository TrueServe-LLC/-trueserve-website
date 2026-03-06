import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import MobileNav from '@/components/MobileNav';
import '@testing-library/jest-dom';

// Mock the Next.js hooks and actions
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
}));

jest.mock('@/app/auth/actions', () => ({
    logout: jest.fn(),
}));

describe('MobileNav Component', () => {
    // Helper to strongly type the mock
    const mockUsePathname = usePathname as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('hides completely on blacklisted routes (e.g. /login)', () => {
        mockUsePathname.mockReturnValue('/login');
        const { container } = render(<MobileNav />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders Driver Navigation when pathname starts with /driver', () => {
        mockUsePathname.mockReturnValue('/driver/dashboard');
        render(<MobileNav role="DRIVER" />);

        // Expect standard driver tabs to be visible
        expect(screen.getByText('Board')).toBeInTheDocument();
        expect(screen.getByText('Trips')).toBeInTheDocument();
        expect(screen.getByText('Pay')).toBeInTheDocument();

        // Ensure merchant and customer tabs are NOT visible
        expect(screen.queryByText('Orders')).not.toBeInTheDocument(); // merchant
        expect(screen.queryByText('Cart')).not.toBeInTheDocument(); // customer
    });

    it('renders Merchant Navigation when pathname starts with /merchant', () => {
        mockUsePathname.mockReturnValue('/merchant/menu');
        render(<MobileNav role="MERCHANT" />);

        // Expect merchant tabs to be visible
        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('Menu')).toBeInTheDocument();
        expect(screen.getByText('Log out')).toBeInTheDocument();

        // Ensure driver tabs are NOT visible
        expect(screen.queryByText('Board')).not.toBeInTheDocument();
    });

    it('renders Default Customer Navigation on standard routes', () => {
        mockUsePathname.mockReturnValue('/restaurants');
        render(<MobileNav role="CUSTOMER" />);

        // Expect customer tabs to be visible
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Sell')).toBeInTheDocument();
        expect(screen.getByText('Drive')).toBeInTheDocument();
        expect(screen.getByText('Cart')).toBeInTheDocument();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('defaults to Customer Navigation if no role is explicitly passed', () => {
        mockUsePathname.mockReturnValue('/orders');
        render(<MobileNav role={null} />);

        // It should still default to customer links if navigating normal app routes
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Cart')).toBeInTheDocument();
    });
});
