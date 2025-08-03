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

interface DialogCloseProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DialogClose: React.FC<DialogCloseProps> = ({ children, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </button>
  );
};

interface DialogRootProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DialogRoot: React.FC<DialogRootProps> = ({ children, open = false, onOpenChange }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
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

// ConfirmationDialog component
interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <div className="p-6 bg-white dark:bg-gray-950">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-2 mb-4">{description}</DialogDescription>
        <div className="flex justify-end gap-3">
          <DialogButton type="secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </DialogButton>
          <DialogButton
            type={variant === 'destructive' ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </DialogButton>
        </div>
      </div>
    </DialogRoot>
  );
}

// SelectionDialog component
type SelectionItem = {
  id: string;
  label: string;
  description?: string;
};

interface SelectionDialogProps {
  title: string;
  items: SelectionItem[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  confirmLabel?: string;
  maxHeight?: string;
}

export function SelectionDialog({
  title,
  items,
  isOpen,
  onClose,
  onConfirm,
  confirmLabel = 'Confirm',
  maxHeight = '60vh',
}: SelectionDialogProps) {
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [selectAll, setSelectAll] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedItems([]);
      setSelectAll(false);
    }
  }, [isOpen]);

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(items.map((item) => item.id));
      setSelectAll(true);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedItems);
    onClose();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <div className="p-6 bg-white dark:bg-gray-950">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-2 mb-4">
          Select the items you want to include and click{' '}
          <span className="font-medium">{confirmLabel}</span>.
        </DialogDescription>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {selectedItems.length} of {items.length} selected
            </span>
            <DialogButton
              type="secondary"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectAll ? 'Deselect All' : 'Select All'}
            </DialogButton>
          </div>

          <div
            className="pr-2 border rounded-md border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
            style={{ maxHeight }}
          >
            {items.length > 0 ? (
              <div className="max-h-64 overflow-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={classNames(
                      'flex items-start space-x-3 p-2 rounded-md transition-colors cursor-pointer',
                      selectedItems.includes(item.id)
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800',
                    )}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label className="text-sm font-medium cursor-pointer">
                        {item.label}
                      </label>
                      {item.description && <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">No items to display</div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <DialogButton type="secondary" onClick={onClose}>
            Cancel
          </DialogButton>
          <DialogButton
            onClick={handleConfirm}
            disabled={selectedItems.length === 0}
          >
            {confirmLabel}
          </DialogButton>
        </div>
      </div>
    </DialogRoot>
  );
}
