import React from 'react';
import { classNames } from '~/utils/classNames';

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'default',
  size = 'md',
  title,
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  };
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={classNames(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
};
