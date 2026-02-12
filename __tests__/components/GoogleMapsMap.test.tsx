
import { render, screen } from '@testing-library/react';
import GoogleMapsMap from '@/components/GoogleMapsMap';

// Mock the Google Maps API Loader & Components
jest.mock('@react-google-maps/api', () => ({
    GoogleMap: ({ children }: any) => <div data-testid="google-map">{children}</div>,
    useJsApiLoader: () => ({ isLoaded: true }),
    Marker: ({ title }: any) => <div data-testid="marker" title={title} />,
    OverlayView: ({ children }: any) => <div data-testid="overlay-view">{children}</div>,
}));

// Mock window.google object for marker icon creation in tests
window.google = {
    maps: {
        Size: class { },
        Point: class { },
        LatLngBounds: class {
            extend() { }
            fitBounds() { }
        },
    }
} as any;

describe('GoogleMapsMap Component', () => {
    // Provide a valid fake key so it doesn't render "Missing Key" message
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-key';

    it('renders markers for restaurants', () => {
        const restaurants = [
            { id: '1', name: 'Test Rest', coords: [35, -80] as [number, number] }
        ];

        render(<GoogleMapsMap center={[35, -80]} restaurants={restaurants} />);

        expect(screen.getByTestId('google-map')).toBeInTheDocument();
        // Since we mock Marker to have title attribute
        expect(screen.getByTitle('Test Rest')).toBeInTheDocument();
    });

    it('renders rotated overlay for driver', () => {
        const drivers = [
            { id: 'd1', name: 'Driver', coords: [35, -80] as [number, number], rotation: 45 }
        ];

        render(<GoogleMapsMap center={[35, -80]} restaurants={drivers} />);

        expect(screen.getByTestId('overlay-view')).toBeInTheDocument();
        // Check for rotation style inside
        const overlay = screen.getByTestId('overlay-view');
        // OverlayView children are rendered inside our mock div
        expect(overlay.innerHTML).toContain('rotate(45deg)');
    });
});
