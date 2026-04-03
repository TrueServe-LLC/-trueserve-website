import React from 'react';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    showPlus?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    orientation?: 'horizontal' | 'vertical';
}

const Logo: React.FC<LogoProps> = ({ 
    className = "", 
    showPlus = false, 
    size = 'md',
    orientation = 'horizontal'
}) => {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-5xl'
    };

    const iconSizeClasses = {
        sm: 'w-8 h-8 p-1',
        md: 'w-10 h-10 p-1.5',
        lg: 'w-12 h-12 p-1.5',
        xl: 'w-16 h-16 p-2'
    };

    const isVertical = orientation === 'vertical';

    return (
        <Link 
            href="/" 
            className={`flex ${isVertical ? 'flex-col justify-center' : 'items-center'} gap-3 md:gap-4 group ${className}`}
        >
            <div className={`${iconSizeClasses[size]} ${isVertical ? 'mx-auto mb-2' : ''} rounded-full border-2 border-slate-600 bg-black/60 flex items-center justify-center overflow-hidden shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                <img src="/logo.png" alt="TrueServe Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`${sizeClasses[size]} font-bold italic tracking-tighter text-white leading-none whitespace-nowrap ${isVertical ? 'text-center' : ''} drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]`} style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800 }}>
                True<span style={{ color: '#e8a230' }}>Serve</span>
                {showPlus && <span className="text-primary ml-0.5 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">+</span>}
            </span>
        </Link>
    );
};

export default Logo;
