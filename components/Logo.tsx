import React from 'react';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ 
    className = "", 
    size = 'md'
}) => {
    const textSizes = {
        sm: 'text-[18px]',
        md: 'text-[24px]',
        lg: 'text-[32px]',
        xl: 'text-[48px]'
    };

    const iconSizes = {
        sm: 'w-[24px] h-[24px] text-[14px]',
        md: 'w-[32px] h-[32px] text-[18px]',
        lg: 'w-[44px] h-[44px] text-[24px]',
        xl: 'w-[64px] h-[64px] text-[36px]'
    };

    return (
        <Link 
            href="/" 
            className={`flex items-center gap-[12px] group active:scale-95 transition-all ${className}`}
        >
            <div className={`${iconSizes[size]} rounded-full bg-[#e8a230] text-black flex items-center justify-center font-black transition-transform group-hover:scale-105 duration-300`}>
                ✓
            </div>
            <span 
                className={`${textSizes[size]} font-extrabold uppercase tracking-widest text-white leading-none whitespace-nowrap`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
                TrueServe
            </span>
        </Link>
    );
};

export default Logo;
