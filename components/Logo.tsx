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
        sm: 'text-[16px]',
        md: 'text-[26px]',
        lg: 'text-[36px]',
        xl: 'text-[48px]'
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
            className={`flex items-center gap-[8px] group active:scale-95 transition-all ${className}`}
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
                    className="w-full h-full object-contain mix-blend-screen"
                />
            </div>
            <div className={`
                ${textSizes[size]} 
                font-sans font-[900] italic tracking-[-0.07em] 
                leading-none flex items-baseline
            `}>
                <span className="text-white">True</span>
                <span className="text-[#e8a230]">Serve</span>
            </div>
        </Link>
    );
};

export default Logo;
