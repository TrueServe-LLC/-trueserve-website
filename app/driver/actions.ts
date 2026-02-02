"use server";

import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import * as fs from 'fs';

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
    const ssn = formData.get("ssn") as string;
    const idDocument = formData.get("idDocument") as File;

    if (!name || !email || !vehicleType || !password || !phone || !ssn || !idDocument) {
        return { message: "Please fill in all fields, including documents.", error: true };
    }

    // Mock Verification
    console.log(`[DriverApp] Docs Received for ${email}: SSN(***-${ssn.slice(-4)}), File(${idDocument.name}, ${idDocument.size} bytes)`);


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
        const { data: existingUser } = await supabase
            .from('User')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (!existingUser) {
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
                try { fs.writeFileSync('debug_driver_error.txt', JSON.stringify(createError, null, 2)); } catch (e) { }

                // CRITICAL: Do NOT proceed if User creation failed
                return { message: "Failed to create user profile (" + createError.message + ").", error: true };
            }
        }

        // 3. Create Driver Profile
        const { data: existingDriver } = await supabase
            .from('Driver')
            .select('id')
            .eq('userId', user.id)
            .maybeSingle();

        if (existingDriver) {
            return { message: "You have already applied!", error: true };
        }

        const { error: driverError } = await supabase
            .from('Driver')
            .insert({
                id: uuidv4(),
                userId: user.id,
                vehicleType,
                status: "OFFLINE",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

        if (driverError) {
            throw driverError;
        }

        // Auto-login cookie for the app
        cookieStore.set("userId", user.id, { secure: true, httpOnly: true });

        return { message: "Application submitted successfully! Welcome to the team.", success: true };

    } catch (e: any) {
        console.error("Failed to submit application:", e);
        return { message: e.message || "Something went wrong.", error: true };
    }
}

import { revalidatePath } from "next/cache";

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
