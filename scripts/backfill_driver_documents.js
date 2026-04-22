const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing required environment variables.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const fileRegex = /^(?<userId>[0-9a-f-]+)_(?<kind>license|insurance|registration)_(?<timestamp>\d+)(?:_[^.]+)?\.[^.]+$/i;
const BUCKET_NAME = "driver-documents";

async function makeBucketPrivate() {
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: false,
    });

    if (!updateError) {
        return;
    }

    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
    });

    if (createError) {
        throw createError;
    }
}

async function backfillDriverDocumentPaths() {
    const { data: drivers, error: driverError } = await supabase
        .from("Driver")
        .select("id, userId, aiMetadata, insuranceDocumentUrl, registrationDocumentUrl");

    if (driverError) throw driverError;

    const { data: files, error: filesError } = await supabase.storage
        .from(BUCKET_NAME)
        .list("", { limit: 1000 });

    if (filesError) throw filesError;

    const latestByDriverAndKind = new Map();

    for (const file of files || []) {
        const match = fileRegex.exec(file.name);
        if (!match?.groups) continue;

        const key = `${match.groups.userId}:${match.groups.kind}`;
        const createdAt = new Date(file.created_at || file.updated_at || 0).getTime();
        const current = latestByDriverAndKind.get(key);
        if (!current || createdAt > current.createdAt) {
            latestByDriverAndKind.set(key, { fileName: file.name, createdAt });
        }
    }

    let updatedDrivers = 0;
    let skippedDrivers = 0;

    for (const driver of drivers || []) {
        const currentPaths = driver.aiMetadata?.documentPaths || {};
        const nextPaths = { ...currentPaths };

        if (!nextPaths.idDocumentPath) {
            const entry = latestByDriverAndKind.get(`${driver.userId}:license`);
            if (entry) nextPaths.idDocumentPath = entry.fileName;
        }

        if (!nextPaths.insuranceDocumentPath) {
            const entry = latestByDriverAndKind.get(`${driver.userId}:insurance`);
            if (entry) nextPaths.insuranceDocumentPath = entry.fileName;
        }

        if (!nextPaths.registrationDocumentPath) {
            const entry = latestByDriverAndKind.get(`${driver.userId}:registration`);
            if (entry) nextPaths.registrationDocumentPath = entry.fileName;
        }

        if (
            nextPaths.idDocumentPath === currentPaths.idDocumentPath &&
            nextPaths.insuranceDocumentPath === currentPaths.insuranceDocumentPath &&
            nextPaths.registrationDocumentPath === currentPaths.registrationDocumentPath
        ) {
            skippedDrivers += 1;
            continue;
        }

        const nextMetadata = {
            ...(driver.aiMetadata || {}),
            documentPaths: nextPaths,
        };

        const { error } = await supabase
            .from("Driver")
            .update({ aiMetadata: nextMetadata })
            .eq("id", driver.id);

        if (error) throw error;
        updatedDrivers += 1;
    }

    return {
        driverCount: drivers?.length || 0,
        updatedDrivers,
        skippedDrivers,
    };
}

async function main() {
    await makeBucketPrivate();
    const summary = await backfillDriverDocumentPaths();
    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
