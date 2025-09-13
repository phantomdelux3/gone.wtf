'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BlurBackdropProps {
  children?: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  opacity?: number;
  onClick?: () => void;
  zIndex?: number;
  fixed?: boolean;
}

const BlurBackdrop: React.FC<BlurBackdropProps> = ({
  children,
  className,
  blur = 'md',
  opacity = 0.1,
  onClick,
  zIndex = 40,
  fixed = true,
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
    '2xl': 'backdrop-blur-2xl',
    '3xl': 'backdrop-blur-3xl',
  };

  const positionClass = fixed ? 'fixed' : 'absolute';

  return (
    <div
      className={cn(
        'bg-white/10 backdrop-blur-md w-fit h-fit p-2 rounded-lg',
        blurClasses[blur],
        positionClass,
        'flex items-center justify-center',
        'transition-opacity duration-300 ease-in-out',
        className
      )}
      style={{
        zIndex,
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default BlurBackdrop;
