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
        sm: 'text-[15px]',
        md: 'text-[18px]',
        lg: 'text-[24px]',
        xl: 'text-[32px]'
    };

    const iconSizes = {
        sm: 'w-[20px] h-[20px]',
        md: 'w-[26px] h-[26px]',
        lg: 'w-[32px] h-[32px]',
        xl: 'w-[44px] h-[44px]'
    };

    return (
        <Link 
            href="/" 
            className={`flex items-center gap-[12px] group active:scale-95 transition-all ${className}`}
        >
            <div className={`${iconSizes[size]} rounded-full border border-[#e8a230]/40 flex items-center justify-center bg-[#e8a230]/10 backdrop-blur-md shadow-[0_0_15px_rgba(232,162,48,0.1)] transition-transform group-hover:scale-105 duration-300`}>
                <span className="text-[#e8a230] text-[50%] font-black leading-none uppercase">✓</span>
            </div>
            <span className={`${textSizes[size]} font-bold tracking-tight text-white leading-none whitespace-nowrap`}>
                TrueServe
            </span>
        </Link>
    );
};

export default Logo;
