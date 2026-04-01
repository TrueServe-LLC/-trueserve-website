import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Make sure your NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY are in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function syncAllRestaurantRatings() {
    if (!GOOGLE_API_KEY) {
        console.error("Missing Google Maps API Key.");
        return;
    }

    console.log("Starting Google Places Rating Sync...");

    // 1. Fetch all visible restaurants
    const { data: restaurants, error } = await supabase
        .from('Restaurant')
        .select('id, name, city, state, address, rating')
        .eq('visibility', 'VISIBLE');

    if (error || !restaurants) {
        console.error("Failed to fetch restaurants:", error);
        return;
    }

    console.log(`Found ${restaurants.length} restaurants to sync.`);

    let successCount = 0;

    // 2. Loop through and hit Google Places API
    for (const rest of restaurants) {
        try {
            // Build a highly specific search query
            const query = encodeURIComponent(`${rest.name} ${rest.address || ''} ${rest.city} ${rest.state}`);
            
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_API_KEY}`
            );
            
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const place = data.results[0]; // Take the highest match
                const newRating = place.rating; // e.g., 4.6
                const reviewCount = place.user_ratings_total; // e.g., 345

                if (newRating && reviewCount) {
                    console.log(`[SYNCED] ${rest.name}: ${newRating}★ (${reviewCount} reviews)`);
                    
                    // 3. Update the Supabase Database with Real Data
                    await supabase
                        .from('Restaurant')
                        .update({ 
                            rating: newRating // Replaces the fallback data natively
                            // reviewCount: reviewCount // Add this column to Supabase later if you want to display review volume!
                        })
                        .eq('id', rest.id);
                        
                    successCount++;
                } else {
                    console.log(`[NO RATING] ${rest.name} found, but no ratings exist.`);
                }
            } else {
                console.log(`[NOT FOUND] Google could not locate: ${rest.name}`);
            }

            // Wait 200ms to avoid Google API Rate Limiting
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (err: any) {
            console.error(`Error syncing ${rest.name}:`, err.message);
        }
    }

    console.log(`\nSync Complete: Successfully updated ratings for ${successCount}/${restaurants.length} restaurants.`);
}

// To run via terminal: 
// npx tsx scripts/sync_google_ratings.ts
syncAllRestaurantRatings();
