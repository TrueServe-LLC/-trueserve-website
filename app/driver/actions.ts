"use server";

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export type DriverApplicationState = {
    message: string;
    success?: boolean;
    error?: boolean;
};

export async function submitDriverApplication(prevState: any, formData: FormData): Promise<DriverApplicationState> {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const vehicleType = formData.get("vehicleType") as string;

    if (!name || !email || !vehicleType) {
        return { message: "Please fill in all fields.", error: true };
    }

    try {
        // 1. Create the User (if they don't exist) or find them
        // In a real app, this would be an auth flow. Here we just strictly create or fail if exists.

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        let user;

        if (existingUser) {
            // If user exists, check if they are already a driver
            const existingDriver = await prisma.driver.findUnique({
                where: { userId: existingUser.id },
            });

            if (existingDriver) {
                return { message: "You have already applied or are already a driver!", error: true };
            }

            user = existingUser;
        } else {
            // Create new user
            user = await prisma.user.create({
                data: {
                    name,
                    email,
                    role: Role.DRIVER,
                }
            });
        }

        // 2. Create Driver Profile
        await prisma.driver.create({
            data: {
                userId: user.id,
                vehicleType,
                status: "OFFLINE",
            }
        });

        return { message: "Application submitted successfully! Welcome to the team.", success: true };

    } catch (e) {
        console.error("Failed to submit application:", e);
        // Graceful fallback for demo purposes if DB is down
        if ((e as any).code === 'P1001' || (e as any).message?.includes("Can't reach database")) {
            return {
                message: "Application simulated! (Database is offline, so we pretended to save it).",
                success: true
            };
        }
        return { message: "Something went wrong. Please try again later.", error: true };
    }
}
