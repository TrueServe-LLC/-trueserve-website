import { supabase } from "@/lib/supabase";

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
        // 1. Check if user exists
        let { data: existingUser, error: uError } = await supabase
            .from('User')
            .select('id')
            .eq('email', email)
            .single();

        let userId = existingUser?.id;

        if (existingUser) {
            // If user exists, check if they are already a driver
            const { data: existingDriver } = await supabase
                .from('Driver')
                .select('id')
                .eq('userId', existingUser.id)
                .single();

            if (existingDriver) {
                return { message: "You have already applied or are already a driver!", error: true };
            }
        } else {
            // Create new user
            const { data: newUser, error: createError } = await supabase
                .from('User')
                .insert({
                    name,
                    email,
                    role: 'DRIVER',
                })
                .select()
                .single();

            if (createError) {
                throw createError;
            }
            userId = newUser.id;
        }

        // 2. Create Driver Profile
        const { error: driverError } = await supabase
            .from('Driver')
            .insert({
                userId: userId,
                vehicleType,
                status: "OFFLINE",
            });

        if (driverError) {
            throw driverError;
        }

        return { message: "Application submitted successfully! Welcome to the team.", success: true };

    } catch (e) {
        console.error("Failed to submit application:", e);
        return { message: "Something went wrong. Please try again later.", error: true };
    }
}
