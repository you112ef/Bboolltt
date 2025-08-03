import React from 'react';
import { classNames } from '~/utils/classNames';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-2 sm:p-3',
    md: 'p-2 sm:p-3 md:p-4',
    lg: 'p-3 sm:p-4 md:p-6',
  };

  return (
    <div
      className={classNames(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-2 sm:p-3 space-y-1.5',
    md: 'p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2',
    lg: 'p-3 sm:p-4 md:p-6 space-y-2',
  };

  return (
    <div className={classNames('flex flex-col space-y-1.5 sm:space-y-2', sizeClasses[size], className)}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm sm:text-lg',
    lg: 'text-base sm:text-xl',
  };

  return (
    <h3 className={classNames('text-2xl font-semibold leading-none tracking-tight', sizeClasses[size], className)}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-xs sm:text-sm',
    lg: 'text-sm',
  };

  return (
    <p className={classNames('text-sm text-muted-foreground', sizeClasses[size], className)}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-2 sm:p-3 pt-0',
    md: 'p-2 sm:p-3 md:p-4 pt-0',
    lg: 'p-3 sm:p-4 md:p-6 pt-0',
  };

  return (
    <div className={classNames(sizeClasses[size], className)}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-2 sm:p-3 pt-0',
    md: 'p-2 sm:p-3 md:p-4 pt-0',
    lg: 'p-3 sm:p-4 md:p-6 pt-0',
  };

  return (
    <div className={classNames('flex items-center', sizeClasses[size], className)}>
      {children}
    </div>
  );
};
