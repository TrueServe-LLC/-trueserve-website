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

    const containerSizes = {
        sm: 'w-[28px] h-[28px] text-[16px]',
        md: 'w-[36px] h-[36px] text-[20px]',
        lg: 'w-[48px] h-[48px] text-[28px]',
        xl: 'w-[72px] h-[72px] text-[40px]'
    };

    return (
        <Link 
            href="/" 
            className={`flex items-center gap-[12px] group active:scale-95 transition-all ${className}`}
        >
            <div className={`
                ${containerSizes[size]} 
                rounded-full border-2 border-[#e8a230] 
                flex items-center justify-center 
                font-black text-[#e8a230]
                transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(232,162,48,0.3)]
            `}>
                ✓
            </div>
            <span 
                className={`${textSizes[size]} font-extrabold uppercase tracking-widest text-white leading-none whitespace-nowrap font-barlow-cond`}
            >
                TrueServe
            </span>
        </Link>
    );
};

export default Logo;
