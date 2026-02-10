"use server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
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
    const vehicleType = formData.get("vehicleType") as string;
    const phone = formData.get("phone") as string;
    // SSN delayed until approval
    const idDocument = formData.get("idDocument") as File;

    if (!name || !email || !vehicleType || !phone || !idDocument) {
        return { message: "Please fill in all fields, including documents.", error: true };
    }

    // Mock Verification
    console.log(`[DriverApp] Docs Received for ${email}: File(${idDocument.name}, ${idDocument.size} bytes)`);


    try {
        const cookieStore = await cookies();

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
                    role: 'DRIVER',
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
            // If it doesn't, this will error, but we'll catch it and proceed (saving the app is priority).
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
                status: "PENDING_APPROVAL", // Changed from OFFLINE
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
                // Assuming schema doesn't have documentUrl yet. If it did: documentUrl: documentUrl
            });

        if (driverError) {
            throw driverError;
        }

        // Send Confirmation Email to Driver
        await sendEmail(
            email,
            "Application Received - TrueServe Driver",
            `Hi ${name},\n\nThanks for applying to drive with TrueServe! We have received your application and documents.\n\nOur team will review your application shortly. Once approved, you will receive an email to create your account and password.\n\nBest,\nThe TrueServe Team`
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

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
