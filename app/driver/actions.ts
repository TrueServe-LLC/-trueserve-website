"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import * as fs from 'fs';
import * as path from 'path';
import { sendEmail } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { sendSMS } from "@/lib/sms";
import { createNotification } from "@/lib/notifications";

export type DriverApplicationState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function submitDriverApplication(prevState: any, formData: FormData): Promise<DriverApplicationState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const vehicleType = formData.get("vehicleType") as string;
    const phone = formData.get("phone") as string;
    const idDocument = formData.get("idDocument") as File;
    const dob = formData.get("dob") as string;
    const address = formData.get("address") as string;
    const lat = formData.get("lat") as string;
    const lng = formData.get("lng") as string;

    if (!name || !email || !vehicleType || !phone || !idDocument || !dob || !address) {
        return { message: "Please fill in all fields, including documents and address.", error: true };
    }

    // Mock Verification
    console.log(`[DriverApp] Docs Received for ${email}: File(${idDocument.name}, ${idDocument.size} bytes)`);

    try {
        // 1. Ensure Placeholder User Record Exists
        // Use ADMIN client to bypass RLS for User table operations
        const { data: userByEmail } = await supabaseAdmin
            .from('User')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        let targetUserId = userByEmail?.id;

        if (!targetUserId) {
            targetUserId = uuidv4();
            // Create Placeholder User
            const { error: createError } = await supabaseAdmin
                .from('User')
                .insert({
                    id: targetUserId,
                    name,
                    email,
                    phone,
                    role: 'DRIVER',
                    address,
                    dob,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

            if (createError) {
                console.error("User Sync Error:", createError);
                return { message: "Failed to create user profile (" + createError.message + ").", error: true };
            }
        }

        // 3. Create Driver Profile
        // Attempt to upload document
        let documentUrl = "";
        try {
            // Create a unique file name
            const fileExt = idDocument.name.split('.').pop();
            const fileName = `${targetUserId}_${Date.now()}.${fileExt}`;

            // Note: 'driver-documents' bucket must exist in Supabase Storage.
            const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
                .from('driver-documents')
                .upload(fileName, idDocument);

            if (!uploadError && uploadData) {
                const { data: publicUrlData } = supabaseAdmin.storage
                    .from('driver-documents')
                    .getPublicUrl(fileName);
                documentUrl = publicUrlData.publicUrl;
            } else {
                console.warn("[DriverApp] Document upload failed:", uploadError?.message);
            }
        } catch (uploadErr) {
            console.warn("[DriverApp] Document upload exception:", uploadErr);
        }

        const { data: existingDriver } = await supabaseAdmin
            .from('Driver')
            .select('id')
            .eq('userId', targetUserId)
            .maybeSingle();

        if (existingDriver) {
            return { message: "You have already applied!", error: true };
        }

        const { error: driverError } = await supabaseAdmin
            .from('Driver')
            .insert({
                id: uuidv4(),
                userId: targetUserId,
                vehicleType: vehicleType,
                address: address,
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null,
                status: "PENDING_APPROVAL",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        if (driverError) {
            throw driverError;
        }

        // Read Onboarding Document
        let attachments = [];
        try {
            const docPath = path.join(process.cwd(), 'public', 'assets', 'Driver_Onboarding_Process_Complete.docx');
            if (fs.existsSync(docPath)) {
                const docContent = fs.readFileSync(docPath);
                attachments.push({
                    filename: 'Driver_Onboarding_Process_Complete.docx',
                    content: docContent
                });
            } else {
                console.warn("Onboarding document not found at:", docPath);
            }
        } catch (e) {
            console.error("Failed to read onboarding document:", e);
        }

        // Send Confirmation Email to Driver
        await sendEmail(
            email,
            "Application Received - TrueServe Driver",
            `Hi ${name},\n\nThanks for applying to drive with TrueServe! We have received your application and documents.\n\nOur team will review your application shortly.\n\n**Please find the attached Onboarding Process document for your review.**\n\nOnce approved, you will receive an email to create your account and password.\n\nBest,\nThe TrueServe Team`,
            attachments
        );

        // --- NEW: Send Confirmation SMS to Driver ---
        await sendSMS(
            phone,
            `TrueServe: Hi ${name.split(' ')[0]}, thanks for applying! We've received your documents and will text you once approved.`
        );

        // Send Notification to Admin
        await sendEmail(
            "admin@trueserve.com",
            `New Driver Application: ${name}`,
            `<h1>New Driver Application</h1>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Vehicle:</strong> ${vehicleType}</p>
            <p><strong>Status:</strong> PENDING_APPROVAL</p>
            <hr />
            <p><strong>ID Document:</strong> <a href="${documentUrl || '#'}">${documentUrl ? 'View Document' : 'Upload Failed / Not Available'}</a></p>
            <p>Please review explicitly in Supabase dashboard.</p>`
        );

        return { message: "Application submitted! We'll email you when approved.", success: true };

    } catch (e: any) {
        console.error("Failed to submit application:", e);
        return { message: e.message || "Something went wrong.", error: true };
    }
}

export async function acceptOrder(orderId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Not logged in");
        }

        // Get Driver ID
        const { data: driver } = await supabase
            .from('Driver')
            .select('id')
            .eq('userId', user.id)
            .single();

        if (!driver) throw new Error("Driver profile not found");

        const { error, data: updatedOrder } = await supabase
            .from('Order')
            .update({
                driverId: driver.id,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId)
            .in('status', ['PENDING', 'PREPARING', 'READY_FOR_PICKUP'])
            .is('driverId', null) // Ensure not already taken
            .select()
            .single();

        if (error || !updatedOrder) throw new Error("Failed to accept order. It may have been taken or cancelled.");

        // --- NEW: Trigger SMS Confirmation to Driver ---
        try {
            const { data: userData } = await supabaseAdmin.from('User').select('phone').eq('id', user.id).single();
            if (userData?.phone) {
                await sendSMS(userData.phone, "TrueServe: Order confirmed! Navigate to the restaurant to pick up the delivery.");
            }
        } catch (smsErr) {
            console.error("[SMS Confirmation Error]:", smsErr);
        }

        revalidatePath('/driver/dashboard');
        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Accept Order Error:", e);
        return { error: e.message };
    }
}

export async function pickupOrder(orderId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { data: order } = await supabase
            .from('Order')
            .select('status, driverId')
            .eq('id', orderId)
            .single();

        if (!order || order.status !== 'READY_FOR_PICKUP') {
            throw new Error("Order not ready for pickup.");
        }

        const { error } = await supabase
            .from('Order')
            .update({
                status: 'PICKED_UP',
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;

        // --- NEW: Notify Customer ---
        try {
            const { data: orderData } = await supabaseAdmin
                .from('Order')
                .select('userId, restaurant:Restaurant(name)')
                .eq('id', orderId)
                .single();

            if (orderData) {
                await createNotification({
                    userId: orderData.userId,
                    orderId: orderId,
                    title: "Driver Picked Up! 🚗",
                    message: `A driver has picked up your order from ${(orderData.restaurant as any)?.name || "the restaurant"} and is on the way!`
                });
            }
        } catch (notifErr) {
            console.error("[Customer Notification Error]:", notifErr);
        }

        revalidatePath('/driver/dashboard');
        revalidatePath(`/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function completeDelivery(orderId: string) {
    try {
        const supabase = await createClient();

        // 1. Fetch order details for payout calculation
        const { data: order } = await supabase
            .from('Order')
            .select('totalPay, tip, driverId')
            .eq('id', orderId)
            .single();

        if (!order) throw new Error("Order not found");

        // 2. Update order status
        const { error } = await supabase
            .from('Order')
            .update({
                status: 'DELIVERED',
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('status', 'PICKED_UP');

        if (error) throw error;

        // --- NEW: Notify Customer ---
        try {
            const { data: orderData } = await supabaseAdmin
                .from('Order')
                .select('userId, restaurant:Restaurant(name)')
                .eq('id', orderId)
                .single();

            if (orderData) {
                await createNotification({
                    userId: orderData.userId,
                    orderId: orderId,
                    title: "Order Delivered! 🎉",
                    message: `Your order from ${(orderData.restaurant as any)?.name || "the restaurant"} has been delivered. Enjoy your meal!`
                });
            }
        } catch (notifErr) {
            console.error("[Customer Notification Error]:", notifErr);
        }

        // 3. Update Driver Balance (Fare + Tip)
        if (order.driverId) {
            const fare = Number(order.totalPay) || 0;
            const tip = Number(order.tip) || 0;
            const earnings = fare + tip;

            if (earnings > 0) {
                const { error: rpcError } = await supabase.rpc('increment_driver_balance', {
                    driver_id: order.driverId,
                    amount: earnings
                });
                if (rpcError) {
                    console.error("[Balance Update Error]:", rpcError);
                    // We don't throw here to avoid user-facing errors after delivery is already recorded,
                    // but in production we should have a retry mechanism or log this heavily.
                }
            }
        }

        revalidatePath('/driver/dashboard');
        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/driver/dashboard/earnings');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function saveDriverPreferences(prefs: {
    navigationApp: string;
    acceptAlcohol: boolean;
    acceptCash: boolean;
    longDistance: boolean;
}) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        const { error } = await supabase
            .from('Driver')
            .update({
                navigationApp: prefs.navigationApp,
                acceptAlcohol: prefs.acceptAlcohol,
                acceptCash: prefs.acceptCash,
                longDistance: prefs.longDistance,
                updatedAt: new Date().toISOString()
            })
            .eq('userId', user.id);

        if (error) {
            // If columns don't exist yet, we catch it here
            if (error.code === 'PGRST204' || error.message.includes('column')) {
                console.warn("Preference columns missing in DB. Run the migration SQL.");
                return { success: true, warning: "Columns missing" };
            }
            throw error;
        }

        revalidatePath('/driver/dashboard/preferences');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function createDriverStripeAccount() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login?role=driver");
    }

    let url = "";
    try {
        // 1. Get Driver
        const { data: driver } = await supabase
            .from('Driver')
            .select('*')
            .eq('userId', user.id)
            .single();

        if (!driver) throw new Error("Driver profile not found. Please ensure your application is approved.");

        let stripeAccountId = (driver as any).stripeAccountId;

        // Base URL handling for Vercel/Local
        // PRIORITY: If we are on Vercel, use VERCEL_URL. Otherwise use APP_URL or localhost.
        const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
            ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
            : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

        // 2. Create Stripe Account if missing
        if (!stripeAccountId) {
            console.log(`[Stripe] Creating Express account for ${user.email}`);
            const account = await getStripe().accounts.create({
                type: 'express',
                country: 'US',
                email: user.email || undefined,
                capabilities: {
                    transfers: { requested: true },
                },
                metadata: {
                    driverId: driver.id,
                    userId: user.id,
                    role: 'driver'
                }
            });

            stripeAccountId = account.id;

            // Save to DB (Using Admin client to ensure persistence regardless of RLS)
            const { error: updateError } = await supabaseAdmin
                .from('Driver')
                .update({ stripeAccountId })
                .eq('id', driver.id);

            if (updateError) {
                console.error("[Stripe] DB Update Error:", updateError.message);
                throw new Error(`Failed to save Stripe ID: ${updateError.message}`);
            }
        }

        // 3. Create Account Link
        console.log(`[Stripe] Creating Link for ${stripeAccountId} with baseUrl ${baseUrl}`);
        const accountLink = await getStripe().accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${baseUrl}/driver/dashboard/account?stripe=refresh`,
            return_url: `${baseUrl}/driver/dashboard/account?stripe=success`,
            type: 'account_onboarding',
        });

        url = accountLink.url;

    } catch (e: any) {
        // IMPORTANT: Don't catch Next.js redirects!
        if (e.message?.includes('NEXT_REDIRECT') || e.digest?.includes('NEXT_REDIRECT')) {
            throw e;
        }
        console.error("Driver Stripe Connect Error Details:", e);
        throw new Error(`Stripe Connection Failed: ${e.message}`);
    }

    if (url) redirect(url);
}

export async function createDriverPayout() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login?role=driver");

    try {
        // 1. Get Driver
        const { data: driver } = await supabase
            .from('Driver')
            .select('id, balance, stripeAccountId')
            .eq('userId', user.id)
            .single();

        if (!driver) throw new Error("Driver not found");
        if (!driver.stripeAccountId) throw new Error("Stripe account not connected. Please go to Account settings.");

        const balance = Number(driver.balance || 0);
        if (balance <= 0) throw new Error("No balance available to cash out.");

        // 2. Initiate Stripe Transfer (Payout)
        const transfer = await getStripe().transfers.create({
            amount: Math.round(balance * 100), // convert to cents
            currency: 'usd',
            destination: driver.stripeAccountId,
            description: `Driver payout: ${user.email}`,
            metadata: {
                driverId: driver.id,
                userId: user.id
            }
        });

        // 3. Reset Local Balance
        const { error: updateError } = await supabase
            .from('Driver')
            .update({
                balance: 0,
                updatedAt: new Date().toISOString()
            })
            .eq('id', driver.id);

        if (updateError) throw updateError;

        revalidatePath('/driver/dashboard/earnings');
        return { success: true, transferId: transfer.id };

    } catch (e: any) {
        console.error("Payout Error:", e);
        return { error: e.message };
    }
}
