
// Mock fetch globally
global.fetch = jest.fn();

describe('translateText', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
        // Set the key BEFORE each test so the module sees it
        process.env.GOOGLE_TRANSLATE_API_KEY = 'test-key';
        jest.resetModules();
    });

    afterEach(() => {
        delete process.env.GOOGLE_TRANSLATE_API_KEY;
    });

    it('successfully translates text via Google', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: { translations: [{ translatedText: 'Hola' }] }
            })
        });

        const { translateText } = await import("@/app/actions/translate");
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

        const { translateText } = await import("@/app/actions/translate");
        const result = await translateText('Hello', 'es');

        expect(result).toHaveProperty('error', 'Invalid Key');
    });
});
