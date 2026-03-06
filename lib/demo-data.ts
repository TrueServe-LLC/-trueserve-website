
export const MOUNT_AIRY_RESTAURANTS = [
    {
        name: "13 Bones",
        email: "owner_13bones@trueserve.test",
        address: "502 S Andy Griffith Pkwy",
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        cuisine: "BBQ / Steak / Seafood",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2940&auto=format&fit=crop",
        plan: "Flex Scale",
        menuItems: [
            { name: "Buffalo Shrimp", description: "Lightly breaded and fried served with ranch or bleu cheese", price: 10.00, category: "Starters", status: 'APPROVED' },
            { name: "13 Bones Burger", description: "10oz hamburger topped with crispy bacon, cheddar cheese", price: 14.00, category: "Sandwiches", status: 'APPROVED' },
            { name: "Baby Back Ribs (Full)", description: "Our signature ribs basted in KC or Vinegar sauce", price: 26.00, category: "Entrees", status: 'APPROVED' }
        ],
        orders: [
            { id: "DEMO-101", user: { name: "Andy Griffith" }, total: 42.50, status: "PENDING", createdAt: new Date().toISOString(), items: [] },
            { id: "DEMO-102", user: { name: "Barney Fife" }, total: 12.80, status: "PREPARING", createdAt: new Date().toISOString(), items: [] }
        ]
    },
    {
        name: "Snappy Lunch",
        email: "owner_snappylunch@trueserve.test",
        address: "125 N Main St",
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        cuisine: "Breakfast / Lunch / Diner",
        imageUrl: "/snappy_lunch_welcome_banner_1772837103691.png",
        plan: "Flex Scale",
        menuItems: [
            { name: "World-Famous Pork Chop Sandwich", description: "The legendary breaded pork chop sandwich.", price: 8.50, category: "Specials", status: 'APPROVED' },
            { name: "Breaded Cheeseburger", description: "Classic lunch counter cheeseburger.", price: 6.50, category: "Lunch", status: 'APPROVED' }
        ],
        orders: []
    },
    {
        name: "Old North State Winery",
        email: "owner_oldnorthstate@trueserve.test",
        address: "308 North Main St",
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        cuisine: "Winery / American",
        imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=2940&auto=format&fit=crop",
        plan: "Pro Scale",
        menuItems: [
            { name: "ONS Board (Charcuterie)", description: "Three NC Cheeses, Prosciutto, Salami", price: 22.00, category: "Shares", status: 'APPROVED' },
            { name: "ONS Burger", description: "Winery signature burger with house toppings", price: 17.00, category: "Lunch", status: 'APPROVED' }
        ],
        orders: []
    },
    {
        name: "Olympia Family Restaurant",
        email: "owner_olympia@trueserve.test",
        address: "602 Linville Rd",
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        cuisine: "Greco-American / Breakfast",
        imageUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2940&auto=format&fit=crop",
        plan: "Flex Scale",
        menuItems: [
            { name: "Western Omelet", description: "Ham, onions, peppers, and cheese", price: 9.49, category: "Breakfast", status: 'APPROVED' },
            { name: "Rib-eye Steak Sub", description: "Grilled rib-eye with lettuce, tomato, and mayo", price: 11.99, category: "Dinner", status: 'APPROVED' }
        ],
        orders: []
    },
    {
        name: "Little Richard's BBQ",
        email: "owner_littlerichards@trueserve.test",
        address: "455 Frederick St",
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        cuisine: "Southern BBQ",
        imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?q=80&w=2940&auto=format&fit=crop",
        plan: "Flex Scale",
        menuItems: [
            { name: "Chopped BBQ Plate", description: "Served with two sides and hushpuppies.", price: 15.00, category: "Plates", status: 'APPROVED' },
            { name: "LRB Jumbo Smoked Wings", description: "Slow-smoked wings with choice of sauce", price: 17.00, category: "Wings", status: 'APPROVED' }
        ],
        orders: []
    },
    {
        name: "Barney's Cafe",
        email: "owner_barneys@trueserve.test",
        address: "206 N Main St",
        city: "Mount Airy",
        state: "NC",
        zip: "27030",
        cuisine: "Diner / Comfort",
        imageUrl: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=2940&auto=format&fit=crop",
        plan: "Flex Scale",
        menuItems: [
            { name: "Big Country Breakfast", description: "Eggs, choice of meat, grits, and biscuit/toast.", price: 12.00, category: "Breakfast", status: 'APPROVED' },
            { name: "Mayberry Club", description: "Triple decker with ham, turkey, and bacon.", price: 10.50, category: "Sandwiches", status: 'APPROVED' }
        ],
        orders: []
    }
];
