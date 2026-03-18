
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient("https://fwkfddsiiybznvdrmack.supabase.co", supabaseServiceKey!)

async function deepCheck() {
    console.log('--- DEEP COORDINATE CHECK ---');

    // Check Restaurants (re-verify)
    const { data: restaurants } = await supabase.from('Restaurant').select('id, name, lat, lng');
    const badRestaurants = restaurants?.filter(r => isNaN(Number(r.lat)) || isNaN(Number(r.lng)) || r.lat === null);
    if (badRestaurants?.length) console.log('Bad Restaurants:', badRestaurants);

    // Check Drivers (if they have location)
    const { data: drivers } = await supabase.from('Driver').select('id, currentLat, currentLng');
    const badDrivers = drivers?.filter(d =>
        (d.currentLat !== null && isNaN(Number(d.currentLat))) ||
        (d.currentLng !== null && isNaN(Number(d.currentLng)))
    );
    if (badDrivers?.length) console.log('Bad Drivers:', badDrivers);

    // Check ServiceLocations (lat/lng aren't usually in here, but let's check)
    const { data: sloc } = await supabase.from('ServiceLocation').select('*');
    for (const loc of sloc || []) {
        console.log(`ServiceLocation: ${loc.city}, columns:`, Object.keys(loc));
    }

    // Check if any restaurant HAS lat/lng but they are strings 'NaN'
    const { data: stringCheck } = await supabase.from('Restaurant').select('id, name, lat, lng');
    const stringNaN = stringCheck?.filter(r => r.lat === 'NaN' || r.lng === 'NaN');
    if (stringNaN?.length) console.log('String NaN Restaurants:', stringNaN);

    console.log('--- CHECK COMPLETE ---');
}

deepCheck();
