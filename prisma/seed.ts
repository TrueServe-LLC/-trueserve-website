
import { PrismaClient, Role, DriverStatus, OrderStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 1. Create Users

    // Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trueserve.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: 'Admin User',
            role: Role.ADMIN,
        },
    })

    // Merchant User (Restaurant Owner)
    const merchantUser = await prisma.user.upsert({
        where: { email: 'mario@italianplace.com' },
        update: {},
        create: {
            email: 'mario@italianplace.com',
            name: 'Mario Rossi',
            role: Role.MERCHANT,
        },
    })

    // Driver User
    const driverUser = await prisma.user.upsert({
        where: { email: 'john.driver@trueserve.com' },
        update: {},
        create: {
            email: 'john.driver@trueserve.com',
            name: 'John Driver',
            role: Role.DRIVER,
        },
    })

    // Customer User
    const customerUser = await prisma.user.upsert({
        where: { email: 'hungry@customer.com' },
        update: {},
        create: {
            email: 'hungry@customer.com',
            name: 'Hungry Customer',
            role: Role.CUSTOMER,
        },
    })

    // 2. Create Driver Profile
    const driverProfile = await prisma.driver.upsert({
        where: { userId: driverUser.id },
        update: {},
        create: {
            userId: driverUser.id,
            status: DriverStatus.ONLINE,
            vehicleType: 'Car',
            currentLat: 40.7128,
            currentLng: -74.0060, // New York
        },
    })

    // 3. Create Restaurants

    // Charlotte, NC Restaurants
    // @ts-ignore - Schema update might be pending
    const charlotteRestaurant1 = await prisma.restaurant.create({
        data: {
            name: 'Carolina BBQ Pit',
            description: 'Slow-cooked pulled pork and ribs.',
            address: '200 S Tryon St, Charlotte, NC 28202',
            city: 'Charlotte',
            state: 'NC',
            imageUrl: '/restaurant1.jpg',
            lat: 35.2271,
            lng: -80.8431,
            ownerId: merchantUser.id,
            menuItems: {
                create: [
                    { name: 'Pulled Pork Platter', description: 'With carolina gold sauce.', price: 16.99, imageUrl: '/pork.jpg', status: 'APPROVED' },
                    { name: 'Ribs Half Rack', description: 'Fall off the bone ribs.', price: 22.50, imageUrl: '/ribs.jpg', status: 'APPROVED' },
                ],
            },
        },
    })

    // @ts-ignore - Schema update might be pending
    const charlotteRestaurant2 = await prisma.restaurant.create({
        data: {
            name: 'Queen City Burger',
            description: 'Gourmet burgers and shakes.',
            address: '100 N Tryon St, Charlotte, NC 28202',
            city: 'Charlotte',
            state: 'NC',
            imageUrl: '/restaurant2.jpg',
            lat: 35.2280,
            lng: -80.8440,
            owner: { connect: { id: admin.id } }, // Just using admin as owner for demo diversity or create another user if needed, sticking to existing users for simplicity
            menuItems: {
                create: [
                    { name: 'Classic Smash', description: 'Double patty, cheese, onions.', price: 12.99, imageUrl: '/burger.jpg', status: 'APPROVED' },
                ],
            },
        },
    })


    // Ramsey, MN Restaurants
    // Need another merchant for this one technically but reusing for simplicity as ownership isn't key to this test
    // @ts-ignore - Schema update might be pending
    const ramseyRestaurant1 = await prisma.restaurant.create({
        data: {
            name: 'North Star Diner',
            description: 'Comfort food and hearty breakfasts.',
            address: '14200 St Francis Blvd, Ramsey, MN 55303',
            city: 'Ramsey',
            state: 'MN',
            imageUrl: '/restaurant3.jpg',
            lat: 45.2611,
            lng: -93.4566,
            owner: { create: { email: 'ramsey.owner@trueserve.com', name: 'Ramsey Owner', role: Role.MERCHANT } }, // Creating a new owner on the fly
            menuItems: {
                create: [
                    { name: 'Lumberjack Breakfast', description: 'Eggs, pancakes, bacon, sausage.', price: 15.99, imageUrl: '/breakfast.jpg', status: 'APPROVED' },
                    { name: 'Walleye Sandwich', description: 'Fresh caught walleye on a bun.', price: 18.50, imageUrl: '/walleye.jpg', status: 'APPROVED' },
                ],
            },
        },
    })

    // 4. Create an Order
    // First, find a menu item ID
    const porkPlatter = await prisma.menuItem.findFirst({
        where: { name: 'Pulled Pork Platter', restaurantId: charlotteRestaurant1.id },
    })

    if (porkPlatter) {
        await prisma.order.create({
            data: {
                userId: customerUser.id,
                restaurantId: charlotteRestaurant1.id,
                status: OrderStatus.PREPARING,
                total: porkPlatter.price,
                items: {
                    create: [
                        {
                            menuItemId: porkPlatter.id,
                            quantity: 1,
                            price: porkPlatter.price,
                        },
                    ],
                },
            },
        })
    }


    // 5. Create Service Locations
    // @ts-ignore - Schema update might be pending
    await prisma.serviceLocation.upsert({
        where: { city_state: { city: 'Charlotte', state: 'NC' } },
        update: {},
        create: {
            city: 'Charlotte',
            state: 'NC',
            zipPrefixes: ['282', '280', '281'],
            isActive: true,
        }
    })

    // @ts-ignore - Schema update might be pending
    await prisma.serviceLocation.upsert({
        where: { city_state: { city: 'Ramsey', state: 'MN' } },
        update: {},
        create: {
            city: 'Ramsey',
            state: 'MN',
            zipPrefixes: ['553', '550'],
            isActive: true,
        }
    })

    console.log(`Seeding finished. Added users, restaurants in Charlotte & Ramsey, locations, and a sample order.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
