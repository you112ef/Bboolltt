import React, { forwardRef } from 'react';
import { classNames } from '~/utils/classNames';
import { Input } from './Input';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Function to call when the clear button is clicked */
  onClear?: () => void;

  /** Whether to show the clear button when there is input */
  showClearButton?: boolean;

  /** Additional class name for the search icon */
  iconClassName?: string;

  /** Additional class name for the container */
  containerClassName?: string;

  /** Whether the search is loading */
  loading?: boolean;
}

/**
 * SearchInput component
 *
 * A search input field with a search icon and optional clear button.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, placeholder = 'Search...', ...props }, ref) => {
    return (
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
          <div className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 i-ph:magnifying-glass" />
        </div>
        <input
          ref={ref}
          type="text"
          className={classNames(
            'block w-full pl-6 sm:pl-8 pr-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm',
            className,
          )}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';
