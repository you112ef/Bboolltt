import React from 'react';
import { classNames } from '~/utils/classNames';

interface DialogButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const DialogButton: React.FC<DialogButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'primary',
  size = 'md',
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const typeClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  
  const sizeClasses = {
    sm: 'h-6 px-2 py-1 text-xs',
    md: 'h-8 px-3 py-1.5 text-sm',
    lg: 'h-10 px-4 py-2 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        baseClasses,
        typeClasses[type],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  );
};

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={classNames('text-sm sm:text-base md:text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </h2>
  );
};

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={classNames('text-xs sm:text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
};

interface DialogRootProps {
  children: React.ReactNode;
  open?: boolean;
}

export const DialogRoot: React.FC<DialogRootProps> = ({ children, open = false }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" />
      <div className="relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

interface DialogProps {
  children: React.ReactNode;
  onClose?: () => void;
  onBackdrop?: () => void;
}

export const Dialog: React.FC<DialogProps> = ({ children, onClose, onBackdrop }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onBackdrop} />
      <div className="relative bg-background rounded-lg shadow-lg max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};
