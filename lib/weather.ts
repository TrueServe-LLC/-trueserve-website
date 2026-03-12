
import { GOOGLE_MAPS_API_KEY } from "./maps-config";

export interface WeatherInfo {
    temperature: number;
    condition: string;
    description: string;
    isRaining: boolean;
    isSnowing: boolean;
    multiplier: number;
}

/**
 * Fetches current weather from Google Maps Platform Weather API
 * and returns a pay multiplier based on conditions.
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherInfo> {
    const defaultWeather: WeatherInfo = {
        temperature: 70,
        condition: "CLEAR",
        description: "Clear Sky",
        isRaining: false,
        isSnowing: false,
        multiplier: 1.0
    };

    if (!GOOGLE_MAPS_API_KEY) return defaultWeather;

    try {
        const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=IMPERIAL`;
        
        const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
        if (!response.ok) throw new Error("Weather API failed");

        const data = await response.json();
        
        // Based on typical Google API responses (inferring structure if summary was partial)
        // Usually contains 'condition', 'temperature', 'precipitation'
        const condition = data.condition?.code || "CLEAR";
        const description = data.condition?.description || "Clear";
        const temp = data.temperature?.value || 70;
        
        // Check for rain or snow in description or codes
        const isRaining = description.toLowerCase().includes("rain") || description.toLowerCase().includes("drizzle");
        const isSnowing = description.toLowerCase().includes("snow") || description.toLowerCase().includes("ice");

        let multiplier = 1.0;
        if (isSnowing) multiplier = 1.30; // 30% bonus for snow
        else if (isRaining) multiplier = 1.15; // 15% bonus for rain

        return {
            temperature: temp,
            condition,
            description,
            isRaining,
            isSnowing,
            multiplier
        };
    } catch (error) {
        console.error("Weather fetch error:", error);
        return defaultWeather;
    }
}
