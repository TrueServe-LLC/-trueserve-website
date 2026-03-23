"use client";

import React, { useTransition } from 'react';

export default function FastActionBtn({ 
    action, 
    className, 
    children,
    loadingText = "Loading..."
}: { 
    action: () => Promise<void>, 
    className?: string, 
    children: React.ReactNode,
    loadingText?: string
}) {
    const [isPending, startTransition] = useTransition();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await action();
        });
    };

    return (
        <button 
            onClick={handleClick}
            disabled={isPending}
            className={`${className} flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all whitespace-nowrap`}
        >
            {isPending ? (
                <>
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {loadingText}
                </>
            ) : (
                children
            )}
        </button>
    );
}
