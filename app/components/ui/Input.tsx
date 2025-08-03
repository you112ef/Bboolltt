import React from 'react';
import { classNames } from '~/utils/classNames';

interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  type = 'text',
  size = 'md',
}) => {
  const baseClasses = 'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  };

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={classNames(
        baseClasses,
        sizeClasses[size],
        className
      )}
    />
  );
};
