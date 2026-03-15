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
import { scanDocumentWithAI } from "@/lib/aiScanner";
import { calculateDistance } from "@/lib/utils";
import { normalizePhoneNumber } from "@/lib/phoneUtils";

export type DriverApplicationState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function submitDriverApplication(prevState: any, formData: FormData): Promise<DriverApplicationState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const vehicleType = formData.get("vehicleType") as string;
    const vehicleMake = formData.get("vehicleMake") as string;
    const vehicleModel = formData.get("vehicleModel") as string;
    const vehicleColor = formData.get("vehicleColor") as string;
    const licensePlate = formData.get("licensePlate") as string;
    let phone = formData.get("phone") as string;

    // Normalize phone to E.164 for Supabase Auth SMS compatibility
    phone = normalizePhoneNumber(phone || "");
    const idDocument = formData.get("idDocument") as File;
    const insuranceDocument = formData.get("insuranceDocument") as File | null;
    const registrationDocument = formData.get("registrationDocument") as File | null;
    const dob = formData.get("dob") as string;
    const address = formData.get("address") as string;
    const lat = formData.get("lat") as string;
    const lng = formData.get("lng") as string;
    const hasSignedAgreement = formData.get("hasSignedAgreement") === "true";

    if (!name || !email || !vehicleType || !vehicleMake || !vehicleModel || !vehicleColor || !licensePlate || !phone || !idDocument || !insuranceDocument || !registrationDocument || !dob || !address || !hasSignedAgreement) {
        return { message: "Please fill in all fields and sign the agreement.", error: true };
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
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

            if (createError) {
                console.error("User Sync Error:", createError);
                return { message: "Failed to create user profile (" + createError.message + ").", error: true };
            }
        }

        // Helper for uploads
        async function uploadDoc(file: File, prefix: string) {
            if (!file || file.size === 0) return "";
            try {
                // Ensure bucket exists (check first to avoid 400 logs)
                const { data: buckets } = await supabaseAdmin.storage.listBuckets();
                if (!buckets?.find(b => b.id === 'driver-documents')) {
                    await supabaseAdmin.storage.createBucket('driver-documents', { public: true });
                }

                const fileExt = file.name.split('.').pop();
                const fileName = `${targetUserId}_${prefix}_${Date.now()}.${fileExt}`;
                
                const arrayBuffer = await file.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);

                const { data, error } = await supabaseAdmin.storage
                    .from('driver-documents')
                    .upload(fileName, buffer, {
                        contentType: file.type,
                        upsert: false
                    });

                if (!error && data) {
                    const { data: urlData } = supabaseAdmin.storage.from('driver-documents').getPublicUrl(fileName);
                    return urlData.publicUrl;
                } else if (error) {
                    console.error(`Supabase Upload Error for ${prefix}:`, error);
                }
            } catch (e) { 
                console.error(`[Upload Crash] failed for ${prefix}:`, e); 
            }
            return "";
        }

        console.log(`[DriverApp] Triggering Parallel Uploads and AI Scans for ${email}...`);

        // --- PARALLEL EXECUTION: Uploads & AI Scans ---
        const [
            idDocumentUrl,
            insuranceUrl,
            registrationUrl,
            [idScan, insuranceScan, registrationScan]
        ] = await Promise.all([
            uploadDoc(idDocument, "license"),
            uploadDoc(insuranceDocument, "insurance"),
            uploadDoc(registrationDocument, "registration"),
            Promise.all([
                scanDocumentWithAI(idDocument),
                scanDocumentWithAI(insuranceDocument),
                scanDocumentWithAI(registrationDocument)
            ])
        ]);

        const { data: existingDriver } = await supabaseAdmin
            .from('Driver')
            .select('id')
            .eq('userId', targetUserId)
            .maybeSingle();

        if (existingDriver) {
            return { message: "You have already applied!", error: true };
        }

        const backgroundCheckId = `BCK_${uuidv4().split('-')[0].toUpperCase()}`;

        console.log("[AI Scan Results]", { idScan, insuranceScan, registrationScan });

        const isIdValid = idScan?.isValid && idScan?.extractedData?.documentType === 'LICENSE' && !idScan?.extractedData?.isExpired;
        const isInsuranceValid = insuranceScan?.isValid && insuranceScan?.extractedData?.documentType === 'INSURANCE' && !insuranceScan?.extractedData?.isExpired;
        const isRegistrationValid = registrationScan?.isValid && registrationScan?.extractedData?.documentType === 'REGISTRATION' && !registrationScan?.extractedData?.isExpired;

        const isAutoApproved = isIdValid && isInsuranceValid && isRegistrationValid;

        const driveStatus = "OFFLINE";
        const bckStatus = isAutoApproved ? "CLEAR" : "PROCESSING";

        if (isAutoApproved) {
            console.log(`[DriverApp] 🟢 AI AUTO-APPROVED Application for ${email}!`);

            // Create the true Auth identity here so they can log in via SMS!
            const { error: authError } = await supabaseAdmin.auth.admin.createUser({
                id: targetUserId, // link to the raw User row we created earlier
                email: email,
                phone: phone,
                phone_confirm: true,
                email_confirm: true,
                user_metadata: { displayName: name, role: 'DRIVER' }
            });

            if (authError && !authError.message.includes('already exists')) {
                console.error("Auto-Approve Auth Creation Failed:", authError);
            }
        } else {
            console.log(`[DriverApp] 🟡 AI Sent to Manual Review for ${email}. Reason: Scans failed automated compliance checks.`);
        }

        const aiMetadata = {
            idScan,
            insuranceScan,
            registrationScan,
            scannedAt: new Date().toISOString()
        };

        const { error: driverError } = await supabaseAdmin
            .from('Driver')
            .upsert({
                userId: targetUserId,
                vehicleType: vehicleType,
                vehicleMake: vehicleMake,
                vehicleModel: vehicleModel,
                vehicleColor: vehicleColor,
                licensePlate: licensePlate,
                currentLat: (lat && !isNaN(parseFloat(lat))) ? parseFloat(lat) : null,
                currentLng: (lng && !isNaN(parseFloat(lng))) ? parseFloat(lng) : null,
                status: driveStatus,
                backgroundCheckId: backgroundCheckId,
                backgroundCheckStatus: bckStatus,
                vehicleVerified: false, // Always false on signup, admin must approve
                insuranceDocumentUrl: insuranceUrl,
                registrationDocumentUrl: registrationUrl,
                hasSignedAgreement: true,
                agreementSignedAt: new Date().toISOString(),
                aiMetadata: aiMetadata,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'userId' });



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

        // Send Communications in Parallel
        const notificationPromises = [];

        if (isAutoApproved) {
            notificationPromises.push(
                sendEmail(
                    email,
                    "Welcome to TrueServe! Your Account is Approved",
                    `Hi ${name},\n\nGreat news! Our automated integration system has verified your documents and you are approved to drive with TrueServe immediately.\n\n**Please find the attached Onboarding Process document for your review.**\n\nYou can now log in using your email to set a password and start accepting deliveries!\n\nBest,\nThe TrueServe Team`,
                    attachments
                )
            );
            notificationPromises.push(
                sendSMS(
                    phone,
                    `TrueServe: Hi ${name.split(' ')[0]}, great news! Your documents were auto-verified and you are approved to drive immediately. Check your email to login.`
                )
            );
        } else {
            notificationPromises.push(
                sendEmail(
                    email,
                    "Application Received - TrueServe Driver",
                    `Hi ${name},\n\nThanks for applying to drive with TrueServe! We have received your application and documents.\n\nOur team will manually review your application shortly.\n\n**Please find the attached Onboarding Process document for your review.**\n\nOnce approved, you will receive an email to create your account and password.\n\nBest,\nThe TrueServe Team`,
                    attachments
                )
            );
            notificationPromises.push(
                sendSMS(
                    phone,
                    `TrueServe: Hi ${name.split(' ')[0]}, thanks for applying! We've received your documents and will text you once our team reviews them.`
                )
            );
        }

        notificationPromises.push(
            sendEmail(
                "admin@trueserve.com",
                `New Driver Application: ${name} (${driveStatus})`,
                `<h1>New Driver Application</h1>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Vehicle:</strong> ${vehicleColor} ${vehicleMake} ${vehicleModel} (${vehicleType})</p>
                <p><strong>License Plate:</strong> ${licensePlate}</p>
                <p><strong>Status:</strong> <span style="color: ${isAutoApproved ? 'green' : 'orange'}">${driveStatus}</span></p>
                ${isAutoApproved ? `<p><em>This application was automatically approved by the AI Scanner because all 3 documents were verified.</em></p>` : `<p><em>This application requires manual review. AI confidence or document verification failed.</em></p>`}
                <hr />
                <p><strong>ID Document:</strong> <a href="${idDocumentUrl || '#'}">${idDocumentUrl ? 'View License' : 'Not Provided'}</a></p>
                <p><strong>Insurance:</strong> <a href="${insuranceUrl || '#'}">${insuranceUrl ? 'View Insurance' : 'Not Provided'}</a></p>
                <p><strong>Registration:</strong> <a href="${registrationUrl || '#'}">${registrationUrl ? 'View Registration' : 'Not Provided'}</a></p>
                <p>Please review explicitly in Supabase dashboard.</p>`
            )
        );

        await Promise.allSettled(notificationPromises);

        return { message: isAutoApproved ? "Application auto-approved! Check your email to start driving." : "Application submitted! We'll email you when approved.", success: true };

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

export async function completeDelivery(orderId: string, deliveryPin?: string, driverLat?: number, driverLng?: number) {
    try {
        const supabase = await createClient();

        // 1. Fetch order details for payout calculation
        const { data: order } = await supabase
            .from('Order')
            .select('totalPay, tip, driverId, deliveryPin, deliveryLat, deliveryLng')
            .eq('id', orderId)
            .single();

        if (!order) throw new Error("Order not found");

        // Geo-Fenced Safe Drop Protocol
        if (driverLat && driverLng && order.deliveryLat && order.deliveryLng) {
            const distance = Number(calculateDistance(driverLat, driverLng, order.deliveryLat, order.deliveryLng));
            // Require driver to be within 0.05 miles (~260 feet) of the dropoff location
            if (distance > 0.05) {
                return { error: `Geo-Fence Active: You are too far (${distance} mi) from the drop-off location.` };
            }
        }

        if (order.deliveryPin && order.deliveryPin !== deliveryPin) {
            return { error: "Incorrect PIN. Ask customer for the 4-digit PIN." };
        }

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

export async function completePhotoDelivery(formData: FormData) {
    try {
        const orderId = formData.get('orderId') as string;
        const driverLat = parseFloat(formData.get('driverLat') as string);
        const driverLng = parseFloat(formData.get('driverLng') as string);
        const photo = formData.get('photo') as File | null;

        if (!orderId) throw new Error("Order ID is required");

        const supabase = await createClient();

        // 1. Fetch order details for payout calculation
        const { data: order } = await supabase
            .from('Order')
            .select('totalPay, tip, driverId, deliveryLat, deliveryLng')
            .eq('id', orderId)
            .single();

        if (!order) throw new Error("Order not found");

        // Geo-Fenced Safe Drop Protocol
        if (!isNaN(driverLat) && !isNaN(driverLng) && order.deliveryLat && order.deliveryLng) {
            const distance = Number(calculateDistance(driverLat, driverLng, order.deliveryLat, order.deliveryLng));
            if (distance > 0.05) {
                return { error: `Geo-Fence Active: You are too far (${distance} mi) from the drop-off location.` };
            }
        }

        let proofOfDeliveryUrl = null;

        // 2. Upload Photo Proof to Supabase Storage
        if (photo && photo.size > 0) {
            const fileExt = photo.name.split('.').pop() || 'jpg';
            const fileName = `delivery_${orderId}_${Date.now()}.${fileExt}`;
            
            const buffer = Buffer.from(await photo.arrayBuffer());
            
            const { error: uploadError } = await supabaseAdmin
                .storage
                .from('delivery_proofs')
                .upload(fileName, buffer, {
                    contentType: photo.type || 'image/jpeg',
                    upsert: false
                });

            if (uploadError) {
                console.error("Storage upload failed:", uploadError);
                return { error: "Failed to upload photo proof." };
            }

            const { data: publicData } = supabaseAdmin.storage.from('delivery_proofs').getPublicUrl(fileName);
            proofOfDeliveryUrl = publicData.publicUrl;
        }

        // 3. Update order status & attach photo URL
        const checkColumn = await supabase.from('Order').update({ status: 'DELIVERED' }).eq('id', '00000000-0000-0000-0000-000000000000');
        let updatePayload: any = {
            status: 'DELIVERED',
            updatedAt: new Date().toISOString()
        };
        // Add photo URL (We assume column exists, if SQL schema script was executed)
        // If not, we still update status to DELIVERED.
        
        const { error } = await supabase
            .from('Order')
            .update({
                status: 'DELIVERED',
                proofOfDeliveryUrl: proofOfDeliveryUrl,
                updatedAt: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('status', 'PICKED_UP');

        if (error) {
            // fallback if column missing
            await supabase.from('Order').update({ status: 'DELIVERED', updatedAt: new Date().toISOString() }).eq('id', orderId).eq('status', 'PICKED_UP');
        }

        // Notify Customer
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
                    title: "Order Delivered! 📸",
                    message: "Your order has been left at the door. View tracking for a photo of the drop-off!"
                });
            }
        } catch (notifErr) {
            console.error("[Customer Notification Error]:", notifErr);
        }

        // 4. Payout driver
        if (order.driverId) {
            const earnings = (Number(order.totalPay) || 0) + (Number(order.tip) || 0);
            if (earnings > 0) {
                await supabase.rpc('increment_driver_balance', {
                    driver_id: order.driverId,
                    amount: earnings
                });
            }
        }

        revalidatePath('/driver/dashboard');
        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/driver/dashboard/earnings');
        return { success: true };
    } catch (e: any) {
        console.error("Photo Delivery Error", e);
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
        redirect("/driver/login");
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
    if (!user) redirect("/driver/login");

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

export async function updateDriverProfile(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { message: "Unauthorized", error: true };

    const aboutMe = formData.get("aboutMe") as string;
    const photo = formData.get("photo") as File | null;
    let photoUrl = undefined;

    try {
        if (photo && photo.size > 0) {
            const fileExt = photo.name.split('.').pop();
            const fileName = `${user.id}_avatar_${Date.now()}.${fileExt}`;
            const { data, error } = await supabaseAdmin.storage
                .from('driver-documents')
                .upload(fileName, photo);

            if (!error && data) {
                const { data: urlData } = supabaseAdmin.storage.from('driver-documents').getPublicUrl(fileName);
                photoUrl = urlData.publicUrl;
            }
        }

        const updateData: any = {};
        if (aboutMe !== null) updateData.aboutMe = aboutMe;
        if (photoUrl) updateData.photoUrl = photoUrl;

        if (Object.keys(updateData).length > 0) {
            updateData.updatedAt = new Date().toISOString();
            const { error } = await supabaseAdmin
                .from('Driver')
                .update(updateData)
                .eq('userId', user.id);

            if (error) {
                // Ignore missing column errors if migrations haven't run perfectly across branches
                if (!error.message.includes('column')) throw error;
            }
        }

        revalidatePath('/driver/dashboard/account');
        return { message: "Profile updated successfully!", success: true };
    } catch (e: any) {
        console.error("Profile Update Error:", e);
        return { message: "Failed to update profile", error: true };
    }
}

// ============================================================================
// AI Heatmap Predictions (Real API using Gemini)
// ============================================================================
export async function getAIPredictedHeatmap() {
    const supabase = await createClient();

    const { data: orders } = await supabase
        .from('Order')
        .select(`
            total,
            createdAt,
            restaurant:Restaurant(lat, lng)
        `)
        .order('createdAt', { ascending: false })
        .limit(200);

    const heatmapPoints: { lat: number, lng: number, weight: number }[] = [];
    if (!orders || orders.length === 0) return heatmapPoints;

    // Base hotspots
    orders.forEach((o: any) => {
        if (o.restaurant?.lat && o.restaurant?.lng) {
            const hoursOld = (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
            const freshnessMultiplier = Math.max(1, 24 - hoursOld) / 10;
            const weight = (Number(o.total) || 15) * freshnessMultiplier;
            
            heatmapPoints.push({
                lat: o.restaurant.lat,
                lng: o.restaurant.lng,
                weight: weight
            });
        }
    });

    // Get the top recent hotspots to send to the AI
    const topSpots = [...heatmapPoints].sort((a, b) => b.weight - a.weight).slice(0, 20);

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

        const prompt = `You are an AI trained to predict food delivery demand surges.
I will give you the top current hotspot coordinates (latitude, longitude, and weight).
Predict 15 new high-demand coordinate clusters for the upcoming hour.
Assume demand spreads slightly outward from these current hotspots (approx 0.01 - 0.03 degrees) or emerges between them.
Higher weight means higher predicted demand (range 10 to 50).

Respond STRICTLY with a valid raw JSON array of objects. Do not use markdown blocks. Do not include any other text.
Example format: [{"lat": 35.227, "lng": -80.843, "weight": 45.5}]

Current Data:
${JSON.stringify(topSpots.map(s => ({lat: Number(s.lat.toFixed(4)), lng: Number(s.lng.toFixed(4)), weight: Number(s.weight.toFixed(1))}))) }`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, topK: 40 }
            }),
            next: { revalidate: 300 } // Cache predictions for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`Gemini API Error: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        const textResponse = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        // Clean up formatting if the AI ignores instructions and uses markdown
        const cleanedText = textResponse.replace(/^```json/i, '').replace(/```$/i, '').trim();
        
        const predictedSpots: { lat: number, lng: number, weight: number }[] = JSON.parse(cleanedText);
        
        // Combine real current spots with predictive surge spots (given a 1.5x multiplier to stand out)
        for (const spot of predictedSpots) {
            if (spot.lat && spot.lng && spot.weight) {
                heatmapPoints.push({
                    lat: spot.lat,
                    lng: spot.lng,
                    weight: spot.weight * 1.5
                });
            }
        }
        
    } catch (e) {
        console.error("Failed to generate real AI Heatmap Predictions (falling back to current spots):", e);
    }

    return heatmapPoints;
}

// ============================================================================
// Phone Number Masking (Twilio Proxy Calls)
// ============================================================================
export async function initiateMaskedCall(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: order } = await supabase
        .from('Order')
        .select(`
            id,
            user:User(phone)
        `)
        .eq('id', orderId)
        .single();

    if (!order || !(order.user as any)?.phone) {
        return { error: "Customer phone not available or missing" };
    }

    const { data: driver } = await supabase
        .from('User')
        .select('phone')
        .eq('id', user.id)
        .single();

    if (!driver || !driver.phone) {
        return { error: "Driver phone not available or missing" };
    }

    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const proxyServiceSid = process.env.TWILIO_PROXY_SERVICE_SID;

        if (!accountSid || !authToken || !proxyServiceSid) {
            return { error: "Twilio proxy credentials missing from environment" };
        }

        const twilio = require('twilio');
        const client = twilio(accountSid, authToken);

        // 1. Create a dynamic Proxy Session for this specific delivery
        const session = await client.proxy.v1
            .services(proxyServiceSid)
            .sessions.create({
                uniqueName: `delivery_${orderId}_${Date.now()}`,
                ttl: 3600 // Expire after 60 mins exactly like Uber/DoorDash
            });

        // 2. Add Customer as a Participant
        await client.proxy.v1
            .services(proxyServiceSid)
            .sessions(session.sid)
            .participants.create({
                identifier: (order.user as any).phone,
                friendlyName: 'Customer'
            });

        // 3. Add Driver as a Participant
        const driverParticipant = await client.proxy.v1
            .services(proxyServiceSid)
            .sessions(session.sid)
            .participants.create({
                identifier: driver.phone,
                friendlyName: 'Driver'
            });

        const proxyNumber = driverParticipant.proxyIdentifier;
        if (!proxyNumber) return { error: "Failed to allocate proxy number" };

        const telUri = `tel:${proxyNumber}`;
        return { success: true, maskedUri: telUri };
    } catch (e: any) {
        console.error("Proxy Call Error", e);
        return { error: e.message || "Failed to initiate masked call" };
    }
}

// ============================================================================
// Zero-Wait Handoff Notifications
// ============================================================================
export async function triggerZeroWaitHandoff(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const { data: order } = await supabase
            .from('Order')
            .select(`
                status,
                restaurant:Restaurant(ownerId, name)
            `)
            .eq('id', orderId)
            .single();

        if (!order || !['PENDING', 'ACCEPTED', 'PREPARING'].includes(order.status)) {
            return { success: false, reason: "Order not active or already picked up" };
        }

        const ownerId = (order.restaurant as any)?.ownerId;
        if (!ownerId) return { success: false, reason: "No restaurant owner linked" };

        // Prevent duplicate spam: Check if we already sent a Zero-Wait ping for this order today
        const { data: recentNotifs } = await supabase
            .from('Notification')
            .select('id')
            .eq('orderId', orderId)
            .eq('type', 'ZERO_WAIT_HANDOFF')
            .limit(1);

        if (recentNotifs && recentNotifs.length > 0) {
            return { success: true, message: "Already notified" };
        }

        // Notify Restaurant Owner
        await createNotification({
            userId: ownerId,
            orderId: orderId,
            title: "ZERO-WAIT HANDOFF! 🚗💨",
            message: `Driver is arriving in < 2 minutes for Order #${orderId.slice(-4)}. Please bring the order to the counter for an instant handoff!`,
            type: 'ZERO_WAIT_HANDOFF'
        });
        
        return { success: true };
    } catch (e: any) {
        console.error("Zero-Wait Handoff Error", e);
        return { error: e.message };
    }
}

// ============================================================================
// AI Identity Spot Checks
// ============================================================================
export async function performAISpotCheck(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        const file = formData.get('selfie') as File | null;
        if (!file) return { success: false, error: "No image provided" };

        const { verifyDriverIdentityWithAI } = await import('@/lib/aiScanner');
        
        // Use Gemini AI to deeply analyze the selfie to ensure a real live human driver is present (and prevent account sharing / bots)
        const verification = await verifyDriverIdentityWithAI(file);
        
        if (!verification.success) {
            return { 
                success: false, 
                error: `Spot Check Failed: ${verification.reason}` 
            };
        }

        // Ideally, in production we would optionally compare the extracted face data to their ID on file. 
        // For now, logging the successful scan into the database to clear their lock.
        const { error: dbError } = await supabase
            .from('Driver')
            .update({ 
                lastSpotCheckAt: new Date().toISOString() 
            })
            .eq('userId', user.id);

        if (dbError) {
             console.warn("Could not update lastSpotCheckAt column (might not exist yet):", dbError);
        }

        return { success: true, message: "Identity Verified" };
    } catch (e: any) {
        console.error("Spot Check Error:", e);
        return { success: false, error: e.message || "Unknown error during AI face verification." };
    }
}
