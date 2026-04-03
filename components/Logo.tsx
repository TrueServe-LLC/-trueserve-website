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
        xl: 'text-[48px]'
    };

    const iconSizeClasses = {
        sm: 'w-[36px] h-[36px] p-[4px] rounded-[9px]',
        md: 'w-[42px] h-[42px] p-[5px] rounded-[10px]',
        lg: 'w-[52px] h-[52px] p-[6px] rounded-[12px]',
        xl: 'w-[64px] h-[64px] p-[8px] rounded-[16px]'
    };

    return (
        <Link 
            href="/" 
            className={`nav-logo flex items-center gap-[9px] group transition-all active:scale-95 ${className}`}
        >
            <div className={`${iconSizeClasses[size]} bg-[#E8A020] flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                <img src="/logo.png" alt="TrueServe Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`${sizeClasses[size]} font-barlow-cond font-bold tracking-tight text-white leading-none whitespace-nowrap`}>
                True<em className="text-[#E8A020] not-italic">Serve</em>
            </span>
        </Link>
    );
};

export default Logo;
