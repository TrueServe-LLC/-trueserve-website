import { render, screen } from '@testing-library/react';
import GoogleMapsMap from '@/components/GoogleMapsMap';

// Set a fake key so the "Missing Key" guard doesn't fire
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-key';

// Mock the Google Maps API Loader & Components
jest.mock('@react-google-maps/api', () => ({
    GoogleMap: ({ children }: any) => <div data-testid="google-map">{children}</div>,
    useJsApiLoader: () => ({ isLoaded: true }),
    Marker: ({ title }: any) => <div data-testid="marker" title={title} />,
    OverlayView: Object.assign(
        ({ children }: any) => <div data-testid="overlay-view">{children}</div>,
        { OVERLAY_MOUSE_TARGET: 'overlayMouseTarget' }
    ),
}));

// Mock maps-config so GOOGLE_MAPS_API_KEY is never empty in the module
jest.mock('@/lib/maps-config', () => ({
    GOOGLE_MAPS_API_KEY: 'test-key',
    GOOGLE_MAPS_SCRIPT_ID: 'test-script',
    GOOGLE_MAPS_LIBRARIES: [],
}));

// Mock window.google
window.google = {
    maps: {
        Size: class { constructor(public w: number, public h: number) { } },
        Point: class { constructor(public x: number, public y: number) { } },
        LatLngBounds: class {
            extend() { return this; }
            fitBounds() { }
        },
    }
} as any;

describe('GoogleMapsMap Component', () => {
    it('renders markers for restaurants', () => {
        const restaurants = [
            { id: '1', name: 'Test Rest', coords: [35, -80] as [number, number] }
        ];

        render(<GoogleMapsMap center={[35, -80]} restaurants={restaurants} />);

        expect(screen.getByTestId('google-map')).toBeInTheDocument();
        expect(screen.getByTitle('Test Rest')).toBeInTheDocument();
    });

    it('renders rotated overlay for driver', () => {
        const drivers = [
            { id: 'd1', name: 'Driver', coords: [35, -80] as [number, number], rotation: 45 }
        ];

        render(<GoogleMapsMap center={[35, -80]} restaurants={drivers} />);

        expect(screen.getByTestId('overlay-view')).toBeInTheDocument();
        const overlay = screen.getByTestId('overlay-view');
        expect(overlay.innerHTML).toContain('rotate(45deg)');
    });
});
