"use client";

import { useState } from "react";
import { toggleFavorite } from "@/app/user/favorite-actions";

interface FavoriteButtonProps {
    restaurantId: string;
    initialIsFavorited: boolean;
    className?: string;
}

export default function FavoriteButton({ restaurantId, initialIsFavorited, className = "" }: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
    const [isPending, setIsPending] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent link navigation

        if (isPending) return;

        setIsPending(true);
        // Optimistic UI
        setIsFavorited(!isFavorited);

        try {
            const result = await toggleFavorite(restaurantId);
            if (result.error) {
                // Rollback
                setIsFavorited(isFavorited);
                alert(result.error);
            } else if (result.success) {
                setIsFavorited(result.favorited || false);
            }
        } catch (e) {
            setIsFavorited(isFavorited);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${isFavorited
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-black/30 text-white border border-white/10 hover:bg-black/50"
                } ${className}`}
            title={isFavorited ? "Remove from saved" : "Save store"}
        >
            <svg
                className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${isFavorited ? "fill-primary" : "fill-none"}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
        </button>
    );
}
