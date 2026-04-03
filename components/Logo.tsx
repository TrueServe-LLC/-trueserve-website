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
        md: 'text-[22px]',
        lg: 'text-[32px]',
        xl: 'text-[44px]'
    };

    const emblemSizes = {
        sm: 'w-[28px] h-[28px]',
        md: 'w-[44px] h-[44px]',
        lg: 'w-[64px] h-[64px]',
        xl: 'w-[88px] h-[88px]'
    };

    return (
        <Link 
            href="/" 
            className={`flex items-center gap-[12px] group active:scale-95 transition-all ${className}`}
        >
            <div className={`
                ${emblemSizes[size]} 
                rounded-full 
                flex items-center justify-center 
                transition-all duration-300 group-hover:scale-110
            `}>
                <img 
                    src="/logo.png" 
                    alt="TrueServe Icon" 
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(232,162,48,0.3)]"
                />
            </div>
            <div className={`
                ${textSizes[size]} 
                font-barlow-cond font-black italic uppercase tracking-[-0.04em] 
                leading-none flex items-baseline
            `}>
                <span className="text-white">TRUE</span>
                <span className="text-[#e8a230]">SERVE</span>
            </div>
        </Link>
    );
};

export default Logo;
