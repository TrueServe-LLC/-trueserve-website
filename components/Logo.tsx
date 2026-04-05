import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ 
    className = "", 
    size = 'md'
}) => {
    const dim = {
        sm: { img: 24, font: '18px', gap: '8px' },
        md: { img: 32, font: '24px', gap: '10px' },
        lg: { img: 44, font: '32px', gap: '12px' },
        xl: { img: 64, font: '48px', gap: '16px' }
    };

    return (
        <Link 
            href="/" 
            className={`logo-container group ${className}`}
            style={{ 
                display: 'inline-flex',
                alignItems: 'center',
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
                    className="w-full h-full object-contain"
                />
            </div>
            <div 
                className="logo-text"
                style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: dim[size].font,
                    fontWeight: 800,
                    letterSpacing: '-.03em',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'baseline'
                }}
            >
                <span style={{ color: '#fff' }}>True</span>
                <span style={{ color: '#529c92' }}>Serve</span>
            </div>
        </Link>
    );
};

export default Logo;
