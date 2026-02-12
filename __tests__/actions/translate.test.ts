
import { translateText } from "@/app/actions/translate";

// Mock fetch
global.fetch = jest.fn();

describe('translateText', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('successfully translates text via Google', async () => {
        // Setup mock response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    translations: [{ translatedText: 'Hola' }]
                }
            })
        });

        // Set GOOGLE_TRANSLATE_API_KEY
        process.env.GOOGLE_TRANSLATE_API_KEY = 'test-key';

        const result = await translateText('Hello', 'es');

        expect(result).toEqual({ translatedText: 'Hola', provider: 'Google' });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('translation.googleapis.com'),
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('handles Google API error', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: { message: 'Invalid Key' } })
        });

        const result = await translateText('Hello', 'es');

        expect(result).toHaveProperty('error', 'Invalid Key');
    });
});
