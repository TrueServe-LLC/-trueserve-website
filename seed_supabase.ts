
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function seed() {
    console.log('Starting seed...')
    const now = new Date().toISOString();

    // 1. Create Merchant User
    console.log('Creating Merchant User...')
    const merchantId = uuidv4();
    const { data: merchantUser, error: merchantUserError } = await supabase
        .from('User')
        .insert({
            id: merchantId,
            email: `merchant_${Date.now()}@test.com`,
            name: 'Test Merchant',
            role: 'MERCHANT',
            updatedAt: now,
            createdAt: now
        })
        .select()
        .single()

    if (merchantUserError) {
        console.error('Error creating merchant user:', merchantUserError)
        return
    }
    console.log('Merchant User created:', merchantUser.id)

    // 2. Create Restaurant
    console.log('Creating Restaurant...')
    const restaurantId = uuidv4();
    const { data: restaurant, error: restaurantError } = await supabase
        .from('Restaurant')
        .insert({
            id: restaurantId,
            name: 'Test Restaurant',
            address: '123 Test St',
            ownerId: merchantUser.id,
            imageUrl: '/restaurant1.jpg',
            description: 'Best test food in town',
            city: 'Charlotte',
            state: 'NC',
            lat: 35.2271,
            lng: -80.8431,
            updatedAt: now,
            createdAt: now
        })
        .select()
        .single()

    if (restaurantError) {
        console.error('Error creating restaurant:', restaurantError)
        return
    }
    console.log('Restaurant created:', restaurant.id)

    // 3. Create Menu Items
    console.log('Creating Menu Items...')
    const { error: menuError } = await supabase
        .from('MenuItem')
        .insert([
            {
                id: uuidv4(),
                restaurantId: restaurant.id,
                name: 'Test Burger',
                description: 'Juicy test burger',
                price: 12.99,
                status: 'APPROVED',
                imageUrl: '/hero-burger.png',
                updatedAt: now,
                createdAt: now
            },
            {
                id: uuidv4(),
                restaurantId: restaurant.id,
                name: 'Test Pizza',
                description: 'Cheesy test pizza',
                price: 15.99,
                status: 'APPROVED',
                imageUrl: '/hero-pizza.png',
                updatedAt: now,
                createdAt: now
            }
        ])

    if (menuError) console.error('Error creating menu items:', menuError)

    // 4. Create Driver User
    console.log('Creating Driver User...')
    const driverUserId = uuidv4();
    const { data: driverUser, error: driverUserError } = await supabase
        .from('User')
        .insert({
            id: driverUserId,
            email: `driver_${Date.now()}@test.com`,
            name: 'Test Driver',
            role: 'DRIVER',
            updatedAt: now,
            createdAt: now
        })
        .select()
        .single()

    if (driverUserError) {
        console.error('Error creating driver user:', driverUserError)
        return
    }
    console.log('Driver User created:', driverUser.id)

    // 5. Create Driver Profile
    console.log('Creating Driver Profile...')
    const driverId = uuidv4();
    const { data: driver, error: driverProfileError } = await supabase
        .from('Driver')
        .insert({
            id: driverId,
            userId: driverUser.id,
            status: 'ONLINE',
            vehicleType: 'CAR',
            currentLat: 35.2271,
            currentLng: -80.8431,
            updatedAt: now,
            createdAt: now
        })
        .select()
        .single()

    if (driverProfileError) {
        console.error('Error creating driver profile:', driverProfileError)
    } else {
        console.log('Driver Profile created:', driver.id)
    }

    // 6. Create Customer User
    console.log('Creating Customer User...')
    const customerId = uuidv4();
    const { data: customerUser, error: customerUserError } = await supabase
        .from('User')
        .insert({
            id: customerId,
            email: `customer_${Date.now()}@test.com`,
            name: 'Test Customer',
            role: 'CUSTOMER',
            updatedAt: now,
            createdAt: now
        })
        .select()
        .single()

    if (customerUserError) {
        console.error('Error creating customer user:', customerUserError)
        return
    }

    // 7. Create an Order
    console.log('Creating Test Order...')
    const orderId = uuidv4();
    const { data: order, error: orderError } = await supabase
        .from('Order')
        .insert({
            id: orderId,
            userId: customerUser.id,
            restaurantId: restaurant.id,
            driverId: driver?.id,
            status: 'PENDING',
            total: 28.98,
            posReference: `TEST-ORD-${Date.now()}`,
            updatedAt: now,
            createdAt: now
        })
        .select()
        .single()

    if (orderError) {
        console.error('Error creating order:', orderError)
    } else {
        console.log('Order created:', order.id)

        const { data: menuItems } = await supabase.from('MenuItem').select('id, price').eq('restaurantId', restaurant.id)

        if (menuItems && menuItems.length > 0) {
            const orderItems = menuItems.map(item => ({
                id: uuidv4(),
                orderId: order.id,
                menuItemId: item.id,
                quantity: 1,
                price: item.price,
                updatedAt: now,
                createdAt: now
            }))

            await supabase.from('OrderItem').insert(orderItems)
            console.log('Order Items created.')
        }
    }

    console.log('Seed completed successfully!')
}

seed()
