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
            className={`flex items-center gap-3 h-fit group no-underline cursor-pointer ${className}`}
        >
            <div 
                className="rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_2px_10px_rgba(232,160,32,0.3)] group-hover:shadow-[0_4px_20px_rgba(232,160,32,0.5)] group-hover:scale-105"
                style={{ 
                    width: dim[size].img, 
                    height: dim[size].img,
                    background: 'linear-gradient(135deg, var(--gold), #c87010)',
                    fontSize: `${dim[size].img * 0.5}px`
                }}
            >
                🛡️
            </div>
            <div 
                className="font-extrabold leading-none select-none tracking-tight"
                style={{ 
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: dim[size].font,
                    color: 'var(--text)'
                }}
            >
                True<span style={{ color: 'var(--gold)' }}>Serve</span>
                {showPlus && (
                    <span style={{ color: 'var(--gold)', fontSize: '0.6em', marginLeft: '4px', verticalAlign: 'top' }}>+</span>
                )}
            </div>
        </Link>
    );
};

export default Logo;

