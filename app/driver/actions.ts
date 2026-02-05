"use server";

import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import * as fs from 'fs';
import { sendEmail } from "@/lib/email";

export type DriverApplicationState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function submitDriverApplication(prevState: any, formData: FormData): Promise<DriverApplicationState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const vehicleType = formData.get("vehicleType") as string;
    const phone = formData.get("phone") as string;
    // SSN delayed until approval
    const idDocument = formData.get("idDocument") as File;

    if (!name || !email || !vehicleType || !password || !phone || !idDocument) {
        return { message: "Please fill in all fields, including documents.", error: true };
    }

    // Mock Verification
    console.log(`[DriverApp] Docs Received for ${email}: File(${idDocument.name}, ${idDocument.size} bytes)`);


    try {
        const cookieStore = await cookies();

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, role: 'DRIVER' }
            }
        });

        if (authError) {
            if (authError.message.includes("already registered")) {
                return { message: "User already registered. Please log in first.", error: true };
            }
            return { message: authError.message, error: true };
        }

        const user = authData.user;
        if (!user) {
            return { message: "Failed to create account. Please check your email/login.", success: true };
        }

        // 2. Ensure Public User Record Exists
        // First, check by email to avoid unique constraint violations
        const { data: userByEmail } = await supabase
            .from('User')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (userByEmail) {
            // User exists! We should use THIS id instead of the Auth ID if they differ,
            // OR we accept that we can't link them easily if IDs mismatch.
            // For this app, simply ensuring we don't try to INSERT is the fix.
            if (userByEmail.id !== user.id) {
                console.warn(`[DriverApp] User conflict: Email ${email} exists with ID ${userByEmail.id}, but Auth ID is ${user.id}. Using existing record.`);
                // Note: In a real app, you might want to link the Auth ID or merge. 
                // Here we proceed with the EXISTING public ID to allow them to be a driver.
            }
        } else {
            // If NOT found by email, inserting is safe (assuming ID is unique)
            const { error: createError } = await supabase
                .from('User')
                .insert({
                    id: user.id,
                    name,
                    email,
                    role: 'DRIVER',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

            if (createError) {
                console.error("User Sync Error:", createError);
                // CRITICAL: Do NOT proceed if User creation failed
                return { message: "Failed to create user profile (" + createError.message + ").", error: true };
            }
        }

        // Use the correct userId for the Driver profile (prefer existing one if found)
        const targetUserId = userByEmail ? userByEmail.id : user.id;

        // 3. Create Driver Profile
        // Attempt to upload document
        let documentUrl = "";
        try {
            // Create a unique file name
            const fileExt = idDocument.name.split('.').pop();
            const fileName = `${targetUserId}_${Date.now()}.${fileExt}`;

            // Note: 'driver-documents' bucket must exist in Supabase Storage.
            // If it doesn't, this will error, but we'll catch it and proceed (saving the app is priority).
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('driver-documents')
                .upload(fileName, idDocument);

            if (!uploadError && uploadData) {
                const { data: publicUrlData } = supabase.storage
                    .from('driver-documents')
                    .getPublicUrl(fileName);
                documentUrl = publicUrlData.publicUrl;
            } else {
                console.warn("[DriverApp] Document upload failed:", uploadError?.message);
            }
        } catch (uploadErr) {
            console.warn("[DriverApp] Document upload exception:", uploadErr);
        }

        const { data: existingDriver } = await supabase
            .from('Driver')
            .select('id')
            .eq('userId', targetUserId)
            .maybeSingle();

        if (existingDriver) {
            return { message: "You have already applied!", error: true };
        }

        const { error: driverError } = await supabase
            .from('Driver')
            .insert({
                id: uuidv4(),
                userId: targetUserId,
                vehicleType: vehicleType,
                status: "PENDING_APPROVAL", // Changed from OFFLINE
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
                // Assuming schema doesn't have documentUrl yet. If it did: documentUrl: documentUrl
            });

        if (driverError) {
            throw driverError;
        }

        // Auto-login cookie for the app
        cookieStore.set("userId", user.id, { secure: true, httpOnly: true });

        // Send Confirmation Email to Driver
        await sendEmail(
            email,
            "Application Received - TrueServe Driver",
            `Hi ${name},\n\nThanks for applying to drive with TrueServe! We have received your application and documents.\n\nOur team will review your details shortly. You can expect to hear from us within 24-48 hours with the next steps.\n\nBest,\nThe TrueServe Team`
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

        return { message: "Application submitted successfully! Welcome to the team.", success: true };

    } catch (e: any) {
        console.error("Failed to submit application:", e);
        return { message: e.message || "Something went wrong.", error: true };
    }
}

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAsDemoDriver() {
    const cookieStore = await cookies();

    // Check if demo user exists
    const { data: demoUser } = await supabase
        .from('User')
        .select('id')
        .eq('email', 'demo_driver@trueserve.com')
        .maybeSingle();

    let userId = demoUser?.id;

    if (!userId) {
        // Create Demo User
        userId = uuidv4();
        await supabase.from('User').insert({
            id: userId,
            email: 'demo_driver@trueserve.com',
            name: 'Demo Driver',
            role: 'DRIVER',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Create Driver Profile
        await supabase.from('Driver').insert({
            id: uuidv4(),
            userId: userId,
            vehicleType: 'Car',
            status: 'OFFLINE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    // Set Cookie
    cookieStore.set("userId", userId, { secure: true, httpOnly: true });

    // Redirect
    redirect('/driver/dashboard');
}

export async function acceptOrder(orderId: string) {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;
        if (!userId) throw new Error("Not logged in");

        // Get Driver ID
        const { data: driver } = await supabase
            .from('Driver')
            .select('id')
            .eq('userId', userId)
            .single();

        if (!driver) throw new Error("Driver profile not found");

        const { error } = await supabase
            .from('Order')
            .update({
                driverId: driver.id
            })
            .eq('id', orderId)
            .is('driverId', null); // Ensure not already taken

        if (error) throw new Error("Failed to accept order (maybe taken?)");

        revalidatePath('/driver/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error("Accept Order Error:", e);
        return { error: e.message };
    }
}
