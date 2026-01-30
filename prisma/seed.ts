
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

    // 3. Create Restaurant
    const restaurant = await prisma.restaurant.create({
        data: {
            name: 'Bella Italia',
            description: 'Authentic Italian cuisine with homemade pasta.',
            address: '123 Mott St, New York, NY 10013',
            imageUrl: '/restaurant1.jpg', // Placeholder image path
            ownerId: merchantUser.id,
            menuItems: {
                create: [
                    {
                        name: 'Margherita Pizza',
                        description: 'Classic tomato, mozzarella, and basil.',
                        price: 14.99,
                        imageUrl: '/pizza.jpg',
                    },
                    {
                        name: 'Spaghetti Carbonara',
                        description: 'Creamy sauce with guanciale and pecorino.',
                        price: 18.50,
                        imageUrl: '/carbonara.jpg',
                    },
                    {
                        name: 'Tiramisu',
                        description: 'Coffee-soaked ladyfingers dessert.',
                        price: 8.00,
                        imageUrl: '/tiramisu.jpg',
                    },
                ],
            },
        },
    })

    // 4. Create an Order
    // First, find a menu item ID
    const pizza = await prisma.menuItem.findFirst({
        where: { name: 'Margherita Pizza', restaurantId: restaurant.id },
    })

    if (pizza) {
        await prisma.order.create({
            data: {
                userId: customerUser.id,
                restaurantId: restaurant.id,
                status: OrderStatus.PREPARING,
                total: pizza.price,
                items: {
                    create: [
                        {
                            menuItemId: pizza.id,
                            quantity: 1,
                            price: pizza.price,
                        },
                    ],
                },
            },
        })
    }

    console.log(`Seeding finished. Added users, restaurant "${restaurant.name}", and a sample order.`)
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
