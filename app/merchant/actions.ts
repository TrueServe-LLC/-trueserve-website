
"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe";
import { sendSMS } from "@/lib/sms";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createNotification } from "@/lib/notifications";
import { logAuditAction } from "@/lib/audit";
import { pushMenuItemToGHL } from "@/lib/ghl-sync";

export type MerchantActionState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function addMenuItem(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: true, message: "Unauthorized" };

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const image = formData.get("image") as File;

    if (!name || isNaN(price)) {
        return { error: true, message: "Invalid input" };
    }

    try {
        // Get Restaurant ID for this user
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', user.id)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        let imageUrl = null;

        // Auto-create bucket just in case
        await supabaseAdmin.storage.createBucket('menu-images', { public: true }).catch(() => { });

        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const { error: uploadError } = await supabaseAdmin.storage
                .from('menu-images')
                .upload(fileName, buffer, {
                    contentType: image.type,
                    upsert: false
                });

            if (uploadError) {
                console.error("Image upload failed:", uploadError);
                throw new Error("Failed to upload image.");
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from('menu-images')
                .getPublicUrl(fileName);

            imageUrl = publicUrlData.publicUrl;
        }

        const { error } = await supabase
            .from('MenuItem')
            .insert({
                id: uuidv4(),
                restaurantId: restaurant.id,
                name,
                price,
                description,
                imageUrl,
                status: 'APPROVED',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        if (error) throw error;

        // --- GoHighLevel Sync ---
        try {
            const { data: rest } = await supabase.from('Restaurant').select('ghlLocationId, ghlSyncEnabled').eq('id', restaurant.id).single();
            if (rest?.ghlSyncEnabled && rest?.ghlLocationId) {
                await pushMenuItemToGHL({ name, price, description, imageUrl }, rest.ghlLocationId);
            }
        } catch (ghlErr) { console.error("GHL Sync Error (Add):", ghlErr); }
        // -------------------------

        await logAuditAction({ action: "ADD_MENU_ITEM", targetId: restaurant.id, entityType: "Restaurant", message: `Added item: ${name}`, after: { name, price } });

        revalidatePath('/merchant/dashboard');
        return { success: true, message: "Item added successfully" };
    } catch (e: any) {
        console.error("Add Item Error:", e);
        return { error: true, message: e.message || "Failed to add item" };
    }
}

export async function updateMenuItem(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: true, message: "Unauthorized" };

    const itemId = formData.get("itemId") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const ingredientsRaw = formData.get("ingredients") as string;
    const ingredients = ingredientsRaw ? ingredientsRaw.split(',').map(i => i.trim().toLowerCase()).filter(i => i !== "") : [];
    const image = formData.get("image") as File;

    if (!itemId || !name || isNaN(price)) {
        return { error: true, message: "Invalid input" };
    }

    try {
        let imageUrl = formData.get("currentImageUrl") as string || null;

        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const arrayBuffer = await image.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);

            const { error: uploadError } = await supabaseAdmin.storage
                .from('menu-images')
                .upload(fileName, buffer, { contentType: image.type, upsert: false });

            if (!uploadError) {
                const { data: publicUrlData } = supabaseAdmin.storage.from('menu-images').getPublicUrl(fileName);
                imageUrl = publicUrlData.publicUrl;
            }
        }

        const { error } = await supabase
            .from('MenuItem')
            .update({
                name,
                price,
                description,
                imageUrl,
                ingredients,
                updatedAt: new Date().toISOString()
            })
            .eq('id', itemId);


        if (error) throw error;

        // --- GoHighLevel Sync ---
        try {
            const { data: rest } = await supabase.from('Restaurant').select('ghlLocationId, ghlSyncEnabled').eq('ownerId', user.id).single();
            if (rest?.ghlSyncEnabled && rest?.ghlLocationId) {
                await pushMenuItemToGHL({ name, price, description, imageUrl }, rest.ghlLocationId);
            }
        } catch (ghlErr) { console.error("GHL Sync Error:", ghlErr); }
        // -------------------------

        await logAuditAction({ action: "UPDATE_MENU_ITEM", targetId: itemId, entityType: "MenuItem", after: { name, price } });

        revalidatePath('/merchant/dashboard');
        return { success: true, message: "Item updated successfully" };
    } catch (e: any) {
        console.error("Update Item Error:", e);
        return { error: true, message: e.message || "Failed to update item" };
    }
}


export async function updateStoreBanner(prevState: MerchantActionState, formData: FormData): Promise<MerchantActionState> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: true, message: "Unauthorized" };

    const image = formData.get("image") as File;
    if (!image || image.size === 0) return { error: true, message: "No image provided" };

    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', user.id)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        await supabaseAdmin.storage.createBucket('restaurant-banners', { public: true }).catch(() => { });

        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const arrayBuffer = await image.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin.storage
            .from('restaurant-banners')
            .upload(fileName, buffer, { contentType: image.type, upsert: false });

        if (uploadError) throw new Error("Failed to upload image.");

        const { data: publicUrlData } = supabaseAdmin.storage
            .from('restaurant-banners')
            .getPublicUrl(fileName);

        const { error } = await supabase
            .from('Restaurant')
            .update({ imageUrl: publicUrlData.publicUrl, updatedAt: new Date().toISOString() })
            .eq('id', restaurant.id);

        if (error) throw error;

        revalidatePath('/merchant/dashboard');
        return { success: true, message: "Store banner updated successfully." };
    } catch (e: any) {
        console.error("Banner Upload Error:", e);
        return { error: true, message: "Failed to update banner." };
    }
}

export async function updateOrderStatus(orderId: string, nextStatus: string, reason?: string, comment?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: order } = await supabase
            .from('Order')
            .select('status')
            .eq('id', orderId)
            .single();

        if (!order) return { error: "Order not found" };

        const transitions: Record<string, string[]> = {
            'PENDING': ['PREPARING', 'CANCELLED'],
            'PREPARING': ['READY_FOR_PICKUP', 'CANCELLED'],
            'READY_FOR_PICKUP': ['PICKED_UP', 'CANCELLED'],
            'PICKED_UP': ['DELIVERED', 'CANCELLED'],
            'DELIVERED': [],
            'CANCELLED': []
        };

        if (!transitions[order.status]?.includes(nextStatus)) {
            return { error: `Invalid transition from ${order.status} to ${nextStatus}` };
        }

        const updateData: any = { status: nextStatus, updatedAt: new Date().toISOString() };
        if (nextStatus === 'CANCELLED') {
            updateData.cancelReason = reason || 'Merchant Cancelled';
            updateData.cancelComment = comment || 'No comment provided by merchant';
        }

        const { error } = await supabase
            .from('Order')
            .update(updateData)
            .eq('id', orderId);

        if (error) throw error;

        await logAuditAction({ 
            action: "UPDATE_ORDER_STATUS", 
            targetId: orderId, 
            entityType: "Order", 
            before: { status: (order as any).status }, 
            after: { status: nextStatus },
            message: nextStatus === 'CANCELLED' ? `Reason: ${reason}` : ""
        });

        // Notify Customer
        try {
            const { data: orderData } = await supabaseAdmin
                .from('Order')
                .select('userId, restaurant:Restaurant(name)')
                .eq('id', orderId)
                .single();

            if (orderData) {
                const restaurantName = (orderData.restaurant as any)?.name || "Restaurant";
                let title = "Order Update";
                let message = `Your order from ${restaurantName} is now ${nextStatus.toLowerCase().replace('_', ' ')}.`;

                if (nextStatus === 'PREPARING') {
                    title = "Kitchen is cooking! 👨‍🍳";
                    message = `${restaurantName} has started preparing your order.`;
                } else if (nextStatus === 'READY_FOR_PICKUP') {
                    title = "Order Ready! 🍕";
                    message = `Your order is ready. A driver will pick it up shortly.`;
                } else if (nextStatus === 'CANCELLED') {
                    title = "Order Cancelled";
                    message = `We're sorry, your order from ${restaurantName} was cancelled.`;
                }

                await createNotification({
                    userId: orderData.userId,
                    orderId: orderId,
                    title,
                    message
                });
            }
        } catch (notifErr) {
            console.error("Notification Error:", notifErr);
        }

        // Trigger SMS Alert to Driver if ready
        if (nextStatus === 'READY_FOR_PICKUP') {
            try {
                const { data: fullOrder } = await supabaseAdmin
                    .from('Order')
                    .select('*, restaurant:Restaurant(name), driver:Driver(userId)')
                    .eq('id', orderId)
                    .single();

                if (fullOrder?.driver && !Array.isArray(fullOrder.driver)) {
                    const driverObj = fullOrder.driver as any;
                    if (driverObj.userId) {
                        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(driverObj.userId);
                        const phone = authData?.user?.phone || authData?.user?.user_metadata?.phone;

                        if (phone) {
                            const message = `TrueServe: ${fullOrder.restaurant.name} order is READY! Please head to the counter for pickup.`;
                            await sendSMS(phone, message);
                        }
                    }
                }
            } catch (smsErr) {
                console.error("SMS Error:", smsErr);
            }
        }

        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function refundOrder(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Order')
            .update({ isRefunded: true, status: 'CANCELLED' })
            .eq('id', orderId);

        if (error) throw error;

        await logAuditAction({ 
            action: "REFUND_ORDER", 
            targetId: orderId, 
            entityType: "Order", 
            message: "Merchant initiated refund and cancellation"
        });
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function generateApiKey() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const newKey = `ts_${uuidv4().replace(/-/g, '')}`;
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id')
            .eq('ownerId', user.id)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const { error } = await supabase
            .from('Restaurant')
            .update({ apiKey: newKey, updatedAt: new Date().toISOString() })
            .eq('id', restaurant.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true, apiKey: newKey };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function submitMerchantInquiry(prevState: any, formData: FormData): Promise<MerchantActionState> {
    const restaurantName = formData.get("restaurantName") as string;
    const contactName = formData.get("contactName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const plan = formData.get("plan") as string;
    const posSystem = formData.get("posSystem") as string || "None";
    const posClientId = formData.get("posClientId") as string || "";
    const posClientSecret = formData.get("posClientSecret") as string || "";
    const phone = formData.get("phone") as string || "";

    if (!restaurantName || !contactName || !email || !password || !address || !city || !state) {
        return { message: "Please fill in all required fields.", error: true };
    }

    try {
        const { data: existingPublicUser } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingPublicUser) {
            return { message: "This email is already registered.", error: true };
        }

        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { displayName: contactName, role: 'MERCHANT' }
        });

        if (authError) throw authError;
        const userId = authData.user!.id;

        // Create Public User
        const { error: userError } = await supabaseAdmin.from('User').insert({
            id: userId,
            email,
            name: contactName,
            role: 'MERCHANT',
            address: `${address}, ${city}, ${state} ${zip}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        if (userError) throw userError;

        // Geocoding
        let lat = 35.2271;
        let lng = -80.8431;

        try {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
                const fullAddress = `${address}, ${city}, ${state} ${zip}`;
                const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`;
                const geoRes = await fetch(geoUrl);
                const geoData = await geoRes.json();
                if (geoData.status === 'OK') {
                    lat = geoData.results[0].geometry.location.lat;
                    lng = geoData.results[0].geometry.location.lng;
                }
            }
        } catch (e) { console.error("Geocoding failed", e); }

        // Create Restaurant
        const restaurantId = uuidv4();
        const { error: restError } = await supabaseAdmin.from('Restaurant').insert({
            id: restaurantId,
            ownerId: userId,
            name: restaurantName,
            address: `${address}, ${city}, ${state} ${zip}`,
            city,
            state,
            lat,
            lng,
            imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200',
            plan: plan || 'Flex Options',
            posSystem,
            posClientId,
            posClientSecret,
            phone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        if (restError) throw restError;

        // Set Cookie manually for the current request context if needed, 
        // but Next.js Action will handle redirect & session normally if we use Auth correctly.
        const cookieStore = await cookies();
        cookieStore.set("userId", userId, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Stripe
        if (plan === 'Pro Subscription') {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trueservedelivery.com";
            const session = await getStripe().checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'TrueServe Pro Plan' },
                        unit_amount: 19900,
                        recurring: { interval: 'month' }
                    },
                    quantity: 1,
                }],
                mode: 'subscription',
                success_url: `${baseUrl}/merchant/onboarding-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/merchant/dashboard`,
                metadata: { restaurantId, userId }
            });
            if (session.url) redirect(session.url);
        }

        // Standard logic for Flex
        await createStripeAccount(userId);
        
        // Notify Team of NEW MERCHANT
        const { data: staffMembers } = await supabaseAdmin
            .from('User')
            .select('email')
            .in('role', ['ADMIN', 'OPS', 'SUPPORT', 'FINANCE', 'PM']);
        
        const staffEmails = staffMembers?.map(s => s.email).filter(Boolean) as string[] || ["admin@trueservedelivery.com"];

        for (const staffEmail of staffEmails) {
            await sendEmail(
                staffEmail,
                `🚨 NEW MERCHANT SIGNUP: ${restaurantName}`,
                `<h1>New Merchant Application</h1>
                <p><strong>Restaurant:</strong> ${restaurantName}</p>
                <p><strong>Contact:</strong> ${contactName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Address:</strong> ${address}, ${city}, ${state} ${zip}</p>
                <p><strong>Selected Plan:</strong> ${plan || 'Flex'}</p>
                <p><strong>POS System:</strong> ${posSystem}</p>
                <hr />
                <p>Please review and approve the merchant in the Admin Registry.</p>`
            );
        }
        
        return { success: true, message: "Signup complete!" };

    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e;
        console.error("Signup Error:", e);
        return { message: e.message || "Signup failed", error: true };
    }
}

export async function createStripeAccount(providedId?: string | FormData) {
    const cookieStore = await cookies();
    let userId: string | undefined;

    if (typeof providedId === 'string') userId = providedId;
    else userId = cookieStore.get("userId")?.value;

    if (!userId) redirect("/login");

    try {
        // Use ADMIN to ensure we find the restaurant even if RLS/Cookies are in transition
        const { data: restaurant } = await supabaseAdmin
            .from('Restaurant')
            .select('*')
            .eq('ownerId', userId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        let stripeAccountId = restaurant.stripeAccountId;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trueservedelivery.com";

        if (!stripeAccountId) {
            const { data: user } = await supabaseAdmin.from('User').select('email').eq('id', userId).single();
            const account = await getStripe().accounts.create({
                type: 'express',
                country: 'US',
                email: user?.email,
                capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
                metadata: { restaurantId: restaurant.id, userId }
            });
            stripeAccountId = account.id;
            await supabaseAdmin.from('Restaurant').update({ stripeAccountId }).eq('id', restaurant.id);
        }

        const accountLink = await getStripe().accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${baseUrl}/merchant/dashboard`,
            return_url: `${baseUrl}/merchant/onboarding-success`,
            type: 'account_onboarding',
        });

        redirect(accountLink.url);
    } catch (e: any) {
        if (e.message?.includes('NEXT_REDIRECT')) throw e;
        console.error("Stripe Error:", e);
        throw e;
    }
}

export async function toggleBusyMode(restaurantId: string, currentStatus: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({ isBusy: !currentStatus, updatedAt: new Date().toISOString() })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;

        await logAuditAction({ 
            action: "TOGGLE_BUSY_MODE", 
            targetId: restaurantId, 
            entityType: "Restaurant", 
            before: { isBusy: currentStatus }, 
            after: { isBusy: !currentStatus } 
        });
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function toggleItemStock(itemId: string, currentStatus: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('MenuItem')
            .update({ isAvailable: !currentStatus, updatedAt: new Date().toISOString() })
            .eq('id', itemId);

        if (error) throw error;

        await logAuditAction({ 
            action: "TOGGLE_ITEM_STOCK", 
            targetId: itemId, 
            entityType: "MenuItem", 
            before: { isAvailable: currentStatus }, 
            after: { isAvailable: !currentStatus } 
        });
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updatePrepTime(restaurantId: string, minutes: number | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({ manualPrepTime: minutes, updatedAt: new Date().toISOString() })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function setBusyDuration(restaurantId: string, minutes: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const busyUntil = new Date(Date.now() + minutes * 60000).toISOString();
        const { error } = await supabase
            .from('Restaurant')
            .update({ 
                isBusy: true, 
                busyUntil: busyUntil,
                updatedAt: new Date().toISOString() 
            })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function upsertBusyZone(restaurantId: string, schedule: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('MerchantSchedule')
            .upsert({
                id: schedule.id || uuidv4(),
                restaurantId,
                ...schedule,
                updatedAt: new Date().toISOString()
            });

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteBusyZone(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('MerchantSchedule')
            .delete()
            .eq('id', id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateAutoPilotSettings(restaurantId: string, enabled: boolean, threshold: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({ 
                autoPilotEnabled: enabled, 
                capacityThreshold: threshold,
                updatedAt: new Date().toISOString() 
            })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}export async function toggleIngredientStock(restaurantId: string, ingredient: string, isNowAvailable: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        // Fetch current out of stock list
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('outOfStockIngredients')
            .eq('id', restaurantId)
            .single();

        let list = restaurant?.outOfStockIngredients || [];
        
        if (isNowAvailable) {
            list = list.filter((i: string) => i !== ingredient.toLowerCase());
        } else {
            if (!list.includes(ingredient.toLowerCase())) {
                list.push(ingredient.toLowerCase());
            }
        }

        const { error } = await supabase
            .from('Restaurant')
            .update({ 
                outOfStockIngredients: list,
                updatedAt: new Date().toISOString() 
            })
            .eq('id', restaurantId)
            .eq('ownerId', user.id);

        if (error) throw error;
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

import { analyzeMerchantSentiment } from "@/lib/customerPulse";

export async function savePosCredentials(posSystem: string, clientId: string, clientSecret: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from('Restaurant')
            .update({ 
                posSystem, 
                posClientId: clientId, 
                posClientSecret: clientSecret,
                updatedAt: new Date().toISOString() 
            })
            .eq('ownerId', user.id);

        if (error) throw error;
        
        await logAuditAction({ 
            action: "UPDATE_POS_CREDENTIALS", 
            targetId: user.id, 
            entityType: "Restaurant", 
            message: `Updated integration for ${posSystem}` 
        });
        
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function getMerchantSentiment(restaurantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: reviews, error } = await supabase
            .from('Review')
            .select('comment, rating')
            .eq('restaurantId', restaurantId)
            .eq('type', 'RESTAURANT')
            .limit(20);

        if (error) throw error;

        const analysis = await analyzeMerchantSentiment(reviews || []);
        return { success: true, analysis };
    } catch (e: any) {
        return { error: e.message };
    }
}

import { generateMerchantBriefing } from "@/lib/merchantAI";

export async function getMerchantBriefing(restaurantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select(`
                name, 
                outOfStockIngredients,
                orders:Order(id, status, createdAt),
                reviews:Review(rating, comment)
            `)
            .eq('id', restaurantId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const briefing = await generateMerchantBriefing({
            restaurantName: restaurant.name,
            recentOrders: (restaurant.orders as any[]) || [],
            reviews: (restaurant.reviews as any[]) || [],
            outOfStock: (restaurant.outOfStockIngredients as string[]) || []
        });

        return { success: true, briefing };
    } catch (e: any) {
        return { error: e.message };
    }
}

import { suggestMenuOptimizations } from "@/lib/merchantAI";

export async function getMenuOptimizations(restaurantId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: restaurant } = await supabase
            .from('Restaurant')
            .select('id, menuItems:MenuItem(*), orders:Order(id, status, items:OrderItem(*))')
            .eq('id', restaurantId)
            .single();

        if (!restaurant) throw new Error("Restaurant not found");

        const optimizations = await suggestMenuOptimizations(restaurant.menuItems || [], restaurant.orders || []);
        return { success: true, optimizations };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function startFlashSale(itemId: string, discountPercent: number, hours: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        // Secure check: Ensure item belongs to a restaurant owned by this user
        const { data: item, error: fetchError } = await supabase
            .from('MenuItem')
            .select('*, restaurant:Restaurant(ownerId)')
            .eq('id', itemId)
            .single();

        if (fetchError || !item) throw new Error("Item not found");
        if ((item.restaurant as any).ownerId !== user.id) throw new Error("Unauthorized: You do not own this restaurant");

        const saleUntil = new Date();
        saleUntil.setHours(saleUntil.getHours() + hours);

        const currentPrice = Number(item.originalPrice || item.price);
        const newPrice = currentPrice * (1 - (discountPercent / 100));

        const { error: updateError } = await supabase
            .from('MenuItem')
            .update({
                originalPrice: currentPrice,
                price: newPrice,
                saleUntil: saleUntil.toISOString(),
                updatedAt: new Date().toISOString()
            })
            .eq('id', itemId);

        if (updateError) throw updateError;

        await logAuditAction({ 
            action: "START_FLASH_SALE", 
            targetId: itemId, 
            entityType: "MenuItem", 
            after: { discountPercent, hours, newPrice } 
        });
        revalidatePath('/merchant/dashboard');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}


export async function sendKitchenReassurance(orderId: string, message: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: order } = await supabase.from('Order').select('userId, id').eq('id', orderId).single();
        if (!order) throw new Error("Order not found");

        const { error } = await supabase
            .from('Notification')
            .insert({
                userId: order.userId,
                title: "Message from the Kitchen",
                message: message,
                type: 'ORDER_UPDATE',
                orderId: order.id,
                isRead: false
            });

        if (error) throw error;
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}


