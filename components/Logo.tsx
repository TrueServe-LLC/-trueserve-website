import React from 'react';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    showPlus?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ 
    className = "", 
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl'
    };

    const iconSizeClasses = {
        sm: 'w-8 h-8 p-1',
        md: 'w-10 h-10 p-1.5',
        lg: 'w-11 h-11 p-1.5',
        xl: 'w-14 h-14 p-2'
    };

    return (
        <Link 
            href="/" 
            className={`flex items-center gap-3 md:gap-4 group ${className}`}
        >
            <div className={`${iconSizeClasses[size]} rounded-full border border-white/20 bg-black flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                <img src="/logo.png" alt="TrueServe Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`${sizeClasses[size]} font-serif italic tracking-tight text-white leading-none whitespace-nowrap`}>
                True<span className="text-[#f59e0b]">Serve</span>
            </span>
        </Link>
    );
};

export default Logo;
