import { supabaseAdmin } from "@/lib/supabase-admin";
import { v4 as uuidv4 } from "uuid";

export const DRIVER_DOC_BUCKET = "driver-documents";
export const DRIVER_DOC_SIGNED_URL_TTL_SECONDS = 60 * 60 * 12;

const PUBLIC_OBJECT_URL_PREFIX = `/storage/v1/object/public/${DRIVER_DOC_BUCKET}/`;

function isHttpUrl(value: string) {
    return /^https?:\/\//i.test(value);
}

export function extractDriverDocumentPath(reference: string) {
    if (!reference) return reference;

    if (!isHttpUrl(reference)) {
        return reference;
    }

    try {
        const parsed = new URL(reference);
        const markerIndex = parsed.pathname.indexOf(PUBLIC_OBJECT_URL_PREFIX);
        if (markerIndex !== -1) {
            return decodeURIComponent(parsed.pathname.slice(markerIndex + PUBLIC_OBJECT_URL_PREFIX.length));
        }

        const segments = parsed.pathname.split("/").filter(Boolean);
        const bucketIndex = segments.findIndex((segment, index) =>
            segment === "public" && segments[index + 1] === DRIVER_DOC_BUCKET
        );

        if (bucketIndex !== -1) {
            return decodeURIComponent(segments.slice(bucketIndex + 2).join("/"));
        }
    } catch {
        return reference;
    }

    return reference;
}

export async function ensureDriverDocumentsBucket() {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
        throw new Error(`Unable to inspect storage buckets: ${error.message}`);
    }

    const existing = buckets?.find((bucket) => bucket.id === DRIVER_DOC_BUCKET);
    if (!existing) {
        const { error: createError } = await supabaseAdmin.storage.createBucket(DRIVER_DOC_BUCKET, {
            public: false,
        });

        if (createError) {
            throw new Error(`Unable to create driver document bucket: ${createError.message}`);
        }
    } else if ((existing as any).public) {
        console.warn(`[DriverDocs] Bucket ${DRIVER_DOC_BUCKET} exists but is still public. Please flip it to private in Supabase storage settings.`);
    }
}

export async function uploadPrivateDriverDocument(file: File, userId: string, prefix: string) {
    if (!file || file.size === 0) {
        return { path: "", signedUrl: null as string | null };
    }

    await ensureDriverDocumentsBucket();

    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${userId}_${prefix}_${Date.now()}_${uuidv4().slice(0, 8)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
        .from(DRIVER_DOC_BUCKET)
        .upload(fileName, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
        });

    if (uploadError) {
        throw new Error(`Failed to upload ${prefix} document: ${uploadError.message}`);
    }

    const { data: signed, error: signedError } = await supabaseAdmin.storage
        .from(DRIVER_DOC_BUCKET)
        .createSignedUrl(fileName, DRIVER_DOC_SIGNED_URL_TTL_SECONDS);

    if (signedError) {
        console.warn(`[DriverDocs] Uploaded ${prefix} document but failed to sign it:`, signedError.message);
    }

    return {
        path: fileName,
        signedUrl: signed?.signedUrl || null,
    };
}

export async function resolveDriverDocumentUrl(reference?: string | null, expiresIn = DRIVER_DOC_SIGNED_URL_TTL_SECONDS) {
    if (!reference) return null;

    if (isHttpUrl(reference)) {
        const objectPath = extractDriverDocumentPath(reference);
        if (objectPath === reference) {
            return reference;
        }

        reference = objectPath;
    }

    const { data, error } = await supabaseAdmin.storage
        .from(DRIVER_DOC_BUCKET)
        .createSignedUrl(reference, expiresIn);

    if (error) {
        console.warn(`[DriverDocs] Failed to create signed URL for ${reference}:`, error.message);
        return null;
    }

    return data?.signedUrl || null;
}
