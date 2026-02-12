
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    folder?: string;
}

export default function ImageUpload({ onUploadComplete, folder = "menus" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await createClient()
                .storage
                .from(folder)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = createClient().storage.from(folder).getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            setFileUrl(publicUrl);
            onUploadComplete(publicUrl);

        } catch (error) {
            alert('Error uploading avatar!');
            console.log(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {fileUrl ? (
                <img
                    src={fileUrl}
                    alt="Uploaded image"
                    className="w-32 h-32 object-cover rounded-lg border border-slate-700"
                />
            ) : (
                <div className="w-32 h-32 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 border border-slate-700 border-dashed">
                    Upload
                </div>
            )}
            <div className="relative">
                <input
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <label className="btn btn-sm btn-outline cursor-pointer pointer-events-none">
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </label>
            </div>
        </div>
    );
}
