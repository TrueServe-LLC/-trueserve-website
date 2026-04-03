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
        sm: 'text-[14px]',
        md: 'text-[16px]',
        lg: 'text-[24px]',
        xl: 'text-[32px]'
    };

    const containerSizes = {
        sm: 'w-[28px] h-[28px]',
        md: 'w-[38px] h-[38px]',
        lg: 'w-[48px] h-[48px]',
        xl: 'w-[64px] h-[64px]'
    };

    const svgSizes = {
        sm: 14,
        md: 18,
        lg: 24,
        xl: 32
    };

    return (
        <Link 
            href="/" 
            className={`flex items-center gap-[10px] group active:scale-95 transition-all ${className}`}
        >
            <div className={`
                ${containerSizes[size]} 
                rounded-full border-[1.5px] border-white/10 
                bg-[#0c0e13]/85 backdrop-blur-[14px]
                flex items-center justify-center 
                transition-all duration-300 group-hover:scale-110 group-hover:border-[#e8a230]/50
            `}>
                <svg width={svgSizes[size]} height={svgSizes[size]} viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="9" r="7" stroke="#e8a230" stroke-width="1.4"/>
                    <path d="M6 9l2.5 2.5L13 7" stroke="#e8a230" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
            </div>
            <span 
                className={`${textSizes[size]} font-bold text-white whitespace-nowrap tracking-normal leading-none`}
                style={{ textShadow: '0 1px 10px rgba(0,0,0,.7)' }}
            >
                TrueServe
            </span>
        </Link>
    );
};

export default Logo;
