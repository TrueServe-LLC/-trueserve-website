
export const GOOGLE_MAPS_LIBRARIES: ("places" | "drawing" | "geometry" | "marker")[] = ["places", "geometry", "drawing", "marker"];

export const GOOGLE_MAPS_SCRIPT_ID = 'google-map-script';

export const GOOGLE_MAPS_API_KEY = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "").trim();
