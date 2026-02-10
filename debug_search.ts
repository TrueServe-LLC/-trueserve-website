
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing keys");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    console.log("Debugging Search Logic with ANON KEY...");

    // 1. Check Service Locations
    console.log("1. Checking ServiceLocations...");
    const { data: locs, error: locError } = await supabase.from('ServiceLocation').select('*').eq('isActive', true);

    if (locError) {
        console.error("Error fetching locations:", locError);
    } else {
        console.log(`Found ${locs?.length} active locations.`);
        if (locs) locs.forEach(l => console.log(` - ${l.city}, ${l.state} (Zip: ${l.zipPrefixes})`));
    }

    // 2. Simulate Search for "Charlotte"
    const term = "Charlotte";
    const termClean = term.trim().toLowerCase();

    // Find matching location locally (mimicking page.tsx)
    const matchedLocation = locs?.find(loc => {
        const cityMatch = loc.city.toLowerCase().includes(termClean);
        return cityMatch;
    });

    if (matchedLocation) {
        console.log(`2. Match Found: ${matchedLocation.city}, ${matchedLocation.state}`);

        // 3. Perform Match Query
        console.log("3. Querying Restaurants with .match()...");
        const { data: restaurants, error: rError } = await supabase
            .from('Restaurant')
            .select('name, city, state')
            .match({ city: matchedLocation.city, state: matchedLocation.state });

        if (rError) console.error("Error fetching restaurants:", rError);
        else console.log(`Found ${restaurants?.length} restaurants for ${matchedLocation.city}.`);

        if (restaurants && restaurants.length > 0) {
            console.log("Sample:", restaurants[0]);
        } else {
            console.log("No restaurants found. Checking if cities match exactly...");
            // Debug failure
            const { data: allRest } = await supabase.from('Restaurant').select('city').limit(5);
            console.log("Sample Restaurant Cities in DB:", allRest);
        }

    } else {
        console.log("2. No matching ServiceLocation found for 'Charlotte'.");
    }
}

debug();
