/**
 * Seeds demo restaurant data so the mobile UI (category pills, cards) is visible.
 * Run with:  SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx npx tsx scripts/seed-demo-restaurants.ts
 * Or set in .env.local and run:  npx tsx scripts/seed-demo-restaurants.ts
 */
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);
const now = new Date().toISOString();

// Charlotte, NC coordinates — adjust if your coverage zone differs
const BASE_LAT = 35.2271;
const BASE_LNG = -80.8431;

const restaurants = [
  {
    name: "Ember & Crust Pizzeria",
    category: "Pizza",
    address: "210 N Tryon St",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT + 0.003,
    lng: BASE_LNG + 0.002,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80",
    rating: "4.8",
    healthGrade: "A",
    complianceStatus: "PASS",
    openTime: "10:00:00",
    closeTime: "23:00:00",
  },
  {
    name: "Stack House Burgers",
    category: "Burgers",
    address: "401 S College St",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT - 0.002,
    lng: BASE_LNG + 0.004,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80",
    rating: "4.7",
    healthGrade: "A",
    complianceStatus: "PASS",
    openTime: "11:00:00",
    closeTime: "22:00:00",
  },
  {
    name: "Sakura Sushi Lounge",
    category: "Sushi",
    address: "815 Providence Rd",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT + 0.005,
    lng: BASE_LNG - 0.003,
    imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80",
    rating: "4.9",
    healthGrade: "A",
    complianceStatus: "APPROVED",
    openTime: "12:00:00",
    closeTime: "22:30:00",
  },
  {
    name: "Wing Republic",
    category: "Wings",
    address: "1204 East Blvd",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT - 0.004,
    lng: BASE_LNG - 0.002,
    imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80",
    rating: "4.6",
    healthGrade: "B",
    complianceStatus: "PASS",
    openTime: "11:00:00",
    closeTime: "00:00:00",
  },
  {
    name: "Cantina Verde Tacos",
    category: "Tacos",
    address: "320 E Morehead St",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT + 0.001,
    lng: BASE_LNG + 0.006,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    rating: "4.8",
    healthGrade: "A",
    complianceStatus: "COMPLIANT",
    openTime: "09:00:00",
    closeTime: "22:00:00",
  },
  {
    name: "Garden & Grain Salads",
    category: "Salads",
    address: "550 S Caldwell St",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT - 0.001,
    lng: BASE_LNG + 0.001,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    rating: "4.5",
    healthGrade: "A",
    complianceStatus: "PASS",
    openTime: "08:00:00",
    closeTime: "20:00:00",
  },
  {
    name: "Nonna's Pasta House",
    category: "Pasta",
    address: "714 Lexington Ave",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT + 0.007,
    lng: BASE_LNG - 0.005,
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80",
    rating: "4.9",
    healthGrade: "A",
    complianceStatus: "APPROVED",
    openTime: "11:30:00",
    closeTime: "21:30:00",
  },
  {
    name: "Morning Glory Breakfast",
    category: "Breakfast",
    address: "2115 Dilworth Rd W",
    city: "Charlotte",
    state: "NC",
    lat: BASE_LAT - 0.006,
    lng: BASE_LNG + 0.003,
    imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&q=80",
    rating: "4.7",
    healthGrade: "A",
    complianceStatus: "PASS",
    openTime: "07:00:00",
    closeTime: "14:00:00",
  },
];

async function seed() {
  // Need a dummy owner user — reuse or create one
  const ownerId = uuidv4();
  const { error: userErr } = await supabase.from('User').insert({
    id: ownerId,
    email: `demo-owner-${Date.now()}@trueserve.dev`,
    name: 'Demo Owner',
    role: 'MERCHANT',
    updatedAt: now,
    createdAt: now,
  });
  if (userErr) {
    console.error('User insert error:', userErr.message);
    process.exit(1);
  }

  for (const r of restaurants) {
    const id = uuidv4();
    const { error } = await supabase.from('Restaurant').insert({
      id,
      ownerId,
      name: r.name,
      category: r.category,
      address: r.address,
      city: r.city,
      state: r.state,
      lat: r.lat,
      lng: r.lng,
      imageUrl: r.imageUrl,
      rating: r.rating,
      healthGrade: r.healthGrade,
      complianceStatus: r.complianceStatus,
      openTime: r.openTime,
      closeTime: r.closeTime,
      isActive: true,
      updatedAt: now,
      createdAt: now,
    });
    if (error) {
      console.error(`Failed to insert "${r.name}":`, error.message);
    } else {
      console.log(`✓ ${r.name}`);
    }
  }

  console.log('\nDone. Visit /restaurants?search=charlotte to see the UI.');
}

seed();
