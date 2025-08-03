import React from 'react';
import { classNames } from '~/utils/classNames';

interface SearchInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  className = '',
  size = 'md',
}) => {
  const baseClasses = 'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  const sizeClasses = {
    sm: 'h-6 pl-6 pr-3 py-1 text-xs',
    md: 'h-8 pl-8 pr-3 py-2 text-sm',
    lg: 'h-10 pl-10 pr-4 py-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <div className={classNames('i-ph:magnifying-glass text-muted-foreground', iconSizeClasses[size])} />
      </div>
      <input
        type="search"
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
    </div>
  );
};
