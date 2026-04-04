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
    // Exact sizing to match the .logo class in the provided template
    const sizes = {
        sm: 'text-[18px]',
        md: 'text-[24px]',
        lg: 'text-[32px]',
        xl: 'text-[48px]'
    };

    return (
        <Link 
            href="/" 
            className={`logo ${sizes[size]} ${className}`}
            style={{ 
                fontWeight: 900, 
                letterSpacing: '-.5px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
            }}
        >
            <span style={{ color: '#fff' }}>True</span>
            <em style={{ color: '#e8a230', fontStyle: 'normal' }}>Serve</em>
        </Link>
    );
};

export default Logo;
