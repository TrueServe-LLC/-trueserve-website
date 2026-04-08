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
    const sizes = {
        sm: { text: 'text-[18px]', icon: 32 },
        md: { text: 'text-[24px]', icon: 40 },
        lg: { text: 'text-[32px]', icon: 48 },
        xl: { text: 'text-[48px]', icon: 60 }
    };

    return (
        <Link 
            href="/" 
            className={`logo ${sizes[size].text} ${className}`}
            style={{ 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}
        >
            <img
                src="/logo.png"
                alt="TrueServe logo"
                width={sizes[size].icon}
                height={sizes[size].icon}
                onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src.endsWith("/logo.png")) {
                        target.src = "/new_logo.png";
                    }
                }}
                style={{
                    borderRadius: '999px',
                    boxShadow: '0 0 20px rgba(232, 162, 48, 0.35)',
                    objectFit: 'cover'
                }}
            />
            <span style={{ color: '#fff', fontWeight: 900, letterSpacing: '-0.02em' }}>True</span>
            <em style={{ color: '#68c7cc', fontStyle: 'normal', fontWeight: 900, letterSpacing: '-0.02em' }}>Serve</em>
        </Link>
    );
};

export default Logo;
