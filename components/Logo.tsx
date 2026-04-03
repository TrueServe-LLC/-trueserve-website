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
        sm: 'text-[21px]',
        md: 'text-[24px]',
        lg: 'text-[32px]',
        xl: 'text-[44px]'
    };

    const iconSizeClasses = {
        sm: 'w-[40px] h-[40px]',
        md: 'w-[48px] h-[48px]',
        lg: 'w-[56px] h-[56px]',
        xl: 'w-[72px] h-[72px]'
    };

    return (
        <Link 
            href="/" 
            className={`flex items-center gap-[12px] group active:scale-95 transition-all ${className}`}
        >
            <div className={`${iconSizeClasses[size]} rounded-full border-[3px] border-[#2A2F3A] bg-black flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-300`}>
                <img src="/logo.png" alt="TrueServe Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`${sizeClasses[size]} font-barlow-cond font-black italic tracking-tight text-white leading-none whitespace-nowrap`}>
                True<span className="text-[#E8A020]">Serve</span>
            </span>
        </Link>
    );
};

export default Logo;
