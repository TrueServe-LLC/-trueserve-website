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
        tags: ["Diner", "Breakfast"],
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
