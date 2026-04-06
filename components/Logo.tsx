import React from 'react';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showPlus?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
    className = "", 
    size = 'md',
    showPlus = false
}) => {
    const dim = {
        sm: { img: 24, font: '24px', gap: '8px' },
        md: { img: 32, font: '32px', gap: '10px' },
        lg: { img: 44, font: '44px', gap: '12px' },
        xl: { img: 64, font: '64px', gap: '16px' }
    };

    return (
        <Link 
            href="/" 
            className={`logo-container group ${className} flex items-center h-fit`}
            style={{ 
                gap: dim[size].gap,
                textDecoration: 'none',
                cursor: 'pointer'
            }}
        >
            <div className="logo-emblem relative" style={{ 
                width: dim[size].img, 
                height: dim[size].img,
                flexShrink: 0 
            }}>
                <img 
                    src="/logo.png" 
                    alt="TrueServe Emblem"
                    className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(232,162,48,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(232,162,48,0.5)] transition-all duration-300"
                />
            </div>
            <div 
                className="logo-text leading-none flex items-baseline select-none"
                style={{ 
                    fontFamily: "var(--font-bebas), sans-serif",
                    fontSize: dim[size].font,
                    letterSpacing: '-.02em',
                }}
            >
                <span className="italic text-white">TRUE</span>
                <span className="italic text-[#e8a230]">SERVE</span>
                {showPlus && (
                    <span className="text-[#e8a230] ml-1.5 align-top" style={{ fontSize: '0.6em' }}>+</span>
                )}
            </div>
        </Link>
    );
};

export default Logo;

