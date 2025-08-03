import React from 'react';
import { classNames } from '~/utils/classNames';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className = '',
  size = 'md',
}) => {
  const baseClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <label
      htmlFor={htmlFor}
      className={classNames(
        baseClasses,
        sizeClasses[size],
        className
      )}
    >
      {children}
    </label>
  );
};
