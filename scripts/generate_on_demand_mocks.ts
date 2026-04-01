import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cities we target
const CITIES = [
  { name: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
  { name: 'Rock Hill', state: 'SC', lat: 34.9249, lng: -81.0251 },
  { name: 'Fort Mill', state: 'SC', lat: 35.0074, lng: -80.9451 },
  { name: 'Gastonia', state: 'NC', lat: 35.2621, lng: -81.1873 }
];

const CATEGORIES = ["Fast Food", "Burgers", "Chicken", "Pizza", "Sushi", "Sandwiches", "Caribbean", "Mexican", "Korean", "Italian", "Seafood"];

async function generateMocks() {
    const args = process.argv.slice(2);
    const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '10');

    console.log(`🌀 Generating ${count} Mock Restaurants for Non-Prod...`);

    const restaurants: any[] = [];

    for (let i = 0; i < count; i++) {
        const cityInfo = faker.helpers.arrayElement(CITIES);
        const name = faker.company.name() + " (Mock)";
        const category = faker.helpers.arrayElement(CATEGORIES);
        
        restaurants.push({
            name: name,
            address: faker.location.streetAddress() + ", " + cityInfo.name + ", " + cityInfo.state,
            city: cityInfo.name,
            state: cityInfo.state,
            lat: cityInfo.lat + (Math.random() - 0.5) * 0.1,
            lng: cityInfo.lng + (Math.random() - 0.5) * 0.1,
            description: faker.company.catchPhrase(),
            tags: [category, faker.helpers.arrayElement(CATEGORIES)],
            rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
            reviewCount: faker.number.int({ min: 10, max: 2000 }),
            visibility: 'VISIBLE',
            isMock: true,
            stripeOnboardingComplete: true,
            imageUrl: `https://images.unsplash.com/photo-${1504674900247 + i}?w=800&q=80`
        });
    }

    const { data: created, error } = await supabase.from('Restaurant').insert(restaurants).select();

    if (error) {
        console.error("❌ Error inserting mock restaurants:", error.message);
        return;
    }

    console.log(`✅ Success: ${created?.length} Restaurants added.`);

    // Generate Menu Items for each restaurant
    console.log("🍖 Generating Menu Items...");
    for (const rest of (created || [])) {
        const items = Array.from({ length: 5 }).map(() => ({
            restaurantId: rest.id,
            name: faker.food.dish(),
            description: faker.food.description(),
            price: faker.number.float({ min: 8, max: 35, fractionDigits: 2 }),
            status: 'APPROVED',
            isAvailable: true,
            category: faker.helpers.arrayElement(['Appetizers', 'Entrees', 'Drinks', 'Desserts']),
            inventory: 99
        }));
        
        await supabase.from('MenuItem').insert(items);
    }

    console.log("✨ All mock data generated perfectly!");
}

generateMocks();
