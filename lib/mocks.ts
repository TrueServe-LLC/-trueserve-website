export const MOCK_RESTAURANTS = [
    {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Carolina BBQ Pit (Mock)",
        address: "123 BBQ Lane, Charlotte, NC",
        rating: 4.8,
        image: "/restaurant1.jpg",
        images: ["/restaurant1.jpg"],
        tags: ["BBQ", "Ribs", "Smoked"],
        description: "Best BBQ in Charlotte, serving slow-smoked ribs and pulled pork since 1985.",
        lat: 35.2271,
        lng: -80.8431,
        city: "Charlotte",
        state: "NC",
        openTime: "11:00:00",
        closeTime: "22:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: [
            { id: "00000000-0000-0000-0000-0000000000a1", name: "Pulled Pork Plate", description: "Slow-smoked pork shoulder with two sides", price: 14.99, image: "/hero-pizza.png", status: "APPROVED", inventory: 50 },
            { id: "00000000-0000-0000-0000-0000000000a2", name: "Half-Rack Ribs", description: "St. Louis style ribs with house sauce", price: 18.50, image: null, status: "APPROVED", inventory: 30 },
            { id: "00000000-0000-0000-0000-0000000000a3", name: "Cornbread", description: "Fresh baked daily", price: 3.50, image: null, status: "APPROVED", inventory: 100 }
        ]
    },
    {
        id: "00000000-0000-0000-0000-000000000002",
        name: "Queen City Burger (Mock)",
        address: "456 Burger Ave, Charlotte, NC",
        rating: 4.5,
        image: "/restaurant2.jpg",
        images: ["/restaurant2.jpg"],
        tags: ["Burgers", "American"],
        description: "Gourmet burgers made with locally sourced beef.",
        lat: 35.2280,
        lng: -80.8440,
        city: "Charlotte",
        state: "NC",
        openTime: "11:00:00",
        closeTime: "23:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: [
            { id: "00000000-0000-0000-0000-0000000000a4", name: "The Queen Burger", description: "Double patty, sharp cheddar, bacon jam", price: 16.99, image: "/hero-burger.png", status: "APPROVED", inventory: 50 },
            { id: "00000000-0000-0000-0000-0000000000a5", name: "Truffle Fries", description: "Hand-cut fries with truffle oil and parmesan", price: 6.50, image: null, status: "APPROVED", inventory: 50 }
        ]
    },
    {
        id: "00000000-0000-0000-0000-000000000003",
        name: "North Star Diner (Mock)",
        address: "789 Diner Rd, Ramsey, MN",
        rating: 4.9,
        image: "/restaurant3.jpg",
        images: ["/restaurant3.jpg"],
        tags: ["Diner", "Breakfast", "American"],
        description: "Hearty Minnesota breakfast served all day.",
        lat: 45.2611,
        lng: -93.4566,
        city: "Ramsey",
        state: "MN",
        openTime: "06:00:00",
        closeTime: "15:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: [
            { id: "00000000-0000-0000-0000-0000000000a6", name: "Pancakes Stack", description: "Three fluffy buttermilk pancakes", price: 10.99, image: null, status: "APPROVED", inventory: 100 },
            { id: "00000000-0000-0000-0000-0000000000a7", name: "Lumberjack Breakfast", description: "Eggs, bacon, sausage, hashbrowns, toast", price: 14.99, image: null, status: "APPROVED", inventory: 50 }
        ]
    },
    {
        id: "00000000-0000-0000-0000-000000000004",
        name: "Sushi Zen (Mock)",
        address: "789 Sakura Way, Charlotte, NC",
        rating: 4.7,
        image: "/restaurant4.jpg",
        tags: ["Sushi", "Asian", "Japanese"],
        description: "Fresh, premium sushi and sashimi in the heart of the city.",
        lat: 35.2290,
        lng: -80.8450,
        city: "Charlotte",
        state: "NC",
        openTime: "12:00:00",
        closeTime: "22:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: [
            { id: "00000000-0000-0000-0000-0000000000a8", name: "Dragon Roll", description: "Shrimp tempura, eel, avocado", price: 15.99, image: "/hero-sushi.png", status: "APPROVED", inventory: 40 }
        ]
    },
    {
        id: "00000000-0000-0000-0000-000000000005",
        name: "Mamma Mia (Mock)",
        address: "321 Pasta Plaza, Charlotte, NC",
        rating: 4.6,
        tags: ["Italian", "Pasta"],
        description: "Authentic homemade pasta and sauces.",
        lat: 35.2260,
        lng: -80.8410,
        city: "Charlotte",
        state: "NC",
        openTime: "16:00:00",
        closeTime: "23:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: []
    },
    {
        id: "00000000-0000-0000-0000-000000000006",
        name: "Taco Loco (Mock)",
        address: "555 Fiesta St, Charlotte, NC",
        rating: 4.3,
        tags: ["Mexican", "Tacos"],
        description: "Street-style tacos with bold flavors.",
        lat: 35.2250,
        lng: -80.8400,
        city: "Charlotte",
        state: "NC",
        openTime: "11:00:00",
        closeTime: "02:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: []
    },
    {
        id: "00000000-0000-0000-0000-000000000007",
        name: "Morning Grind (Mock)",
        address: "88 Bean Blvd, Charlotte, NC",
        rating: 4.8,
        tags: ["Coffee", "Breakfast"],
        description: "Small batch coffee and artisan pastries.",
        lat: 35.2240,
        lng: -80.8390,
        city: "Charlotte",
        state: "NC",
        openTime: "06:00:00",
        closeTime: "18:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: []
    },
    {
        id: "00000000-0000-0000-0000-000000000008",
        name: "Sub Hub (Mock)",
        address: "44 Hoagie Lane, Charlotte, NC",
        rating: 4.2,
        tags: ["Sandwiches", "Fast Food"],
        description: "Freshly sliced meats and signature subs.",
        lat: 35.2230,
        lng: -80.8380,
        city: "Charlotte",
        state: "NC",
        openTime: "10:00:00",
        closeTime: "21:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: []
    },
    {
        id: "00000000-0000-0000-0000-000000000009",
        name: "Ocean's Best (Mock)",
        address: "15 Pier Way, Charlotte, NC",
        rating: 4.5,
        tags: ["Seafood"],
        description: "Fresh catches from the coast every day.",
        lat: 35.2220,
        lng: -80.8370,
        city: "Charlotte",
        state: "NC",
        openTime: "12:00:00",
        closeTime: "22:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: []
    },
    {
        id: "00000000-0000-0000-0000-000000000010",
        name: "Golden Wing (Mock)",
        address: "99 Crispy Ave, Charlotte, NC",
        rating: 4.4,
        tags: ["Chicken", "Fast Food"],
        description: "Crispy wings with over 20 signature sauces.",
        lat: 35.2210,
        lng: -80.8360,
        city: "Charlotte",
        state: "NC",
        openTime: "11:00:00",
        closeTime: "00:00:00",
        visibility: "VISIBLE",
        isMock: true,
        menuItems: []
    },
    {
        id: "00000000-0000-0000-0000-000000000011",
        name: "Pizza Planet (Mock)",
        address: "101 Galactic Way, Charlotte, NC",
        rating: 4.8,
        tags: ["Pizza", "Italian"],
        description: "Out-of-this-world pizza with fresh ingredients.",
        lat: 35.2200,
        lng: -80.8350,
        city: "Charlotte",
        state: "NC",
        isMock: true,
        menuItems: []
    },
    {
        id: "00000000-0000-0000-0000-000000000012",
        name: "Sweet Dreams (Mock)",
        address: "55 Sugar St, Charlotte, NC",
        rating: 4.9,
        tags: ["Desserts", "Sweet"],
        description: "Gourmet cakes, cookies, and pastries.",
        lat: 35.2190,
        lng: -80.8340,
        city: "Charlotte",
        state: "NC",
        isMock: true,
        menuItems: []
    }
];

export const MOCK_ORDERS = [
    {
        id: "mock-order-1",
        restaurantId: "00000000-0000-0000-0000-000000000001",
        status: "PREPARING",
        total: 24.50,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        user: { name: "Alice Johnson", email: "alice@example.com" },
        items: [
            { id: "mi1", menuItem: { name: "Pulled Pork Plate", price: 14.99 }, quantity: 1 },
            { id: "mi2", menuItem: { name: "Cornbread", price: 3.50 }, quantity: 2 }
        ]
    },
    {
        id: "mock-order-2",
        restaurantId: "00000000-0000-0000-0000-000000000001",
        status: "PENDING",
        total: 18.50,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        user: { name: "Bob Smith", email: "bob@example.com" },
        items: [
            { id: "mi3", menuItem: { name: "Half-Rack Ribs", price: 18.50 }, quantity: 1 }
        ]
    },
    {
        id: "mock-order-3",
        restaurantId: "00000000-0000-0000-0000-000000000002",
        status: "PREPARING",
        total: 23.49,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        user: { name: "Charlie Davis", email: "charlie@example.com" },
        items: [
            { id: "mi4", menuItem: { name: "The Queen Burger", price: 16.99 }, quantity: 1 },
            { id: "mi5", menuItem: { name: "Truffle Fries", price: 6.50 }, quantity: 1 }
        ]
    }
];

export function getMockRestaurant(id: string) {
    return MOCK_RESTAURANTS.find(r => r.id === id) || null;
}

export function getMockMenuItem(id: string) {
    for (const r of MOCK_RESTAURANTS) {
        const item = r.menuItems.find(i => i.id === id);
        if (item) return { ...item, restaurantId: r.id };
    }
    return null;
}
