import { useStore } from '@nanostores/react';
import { memo, useEffect, useState } from 'react';
import { themeStore, toggleTheme, setDarkTheme, setLightTheme, detectSystemTheme, setupSystemThemeListener } from '~/lib/stores/theme';
import { classNames } from '~/utils/classNames';

interface ThemeSwitchProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  variant?: 'simple' | 'advanced' | 'toggle';
  showSystemInfo?: boolean;
}

export const ThemeSwitch = memo(({ 
  className, 
  size = 'md', 
  showLabel = false, 
  variant = 'toggle',
  showSystemInfo = false
}: ThemeSwitchProps) => {
  const theme = useStore(themeStore);
  const [domLoaded, setDomLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('light');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setDomLoaded(true);
    setSystemTheme(detectSystemTheme());
    
    // Setup system theme listener
    const cleanup = setupSystemThemeListener();
    return cleanup;
  }, []);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    
    // Reset animation after transition
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setIsAnimating(true);
    if (newTheme === 'dark') {
      setDarkTheme();
    } else {
      setLightTheme();
    }
    
    setTimeout(() => setIsAnimating(false), 300);
    setShowDropdown(false);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (!domLoaded) return null;

  // Simple variant - just a toggle button
  if (variant === 'simple') {
    return (
      <button
        onClick={handleToggle}
        className={classNames(
          'relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out',
          'bg-gray-100 dark:bg-gray-800',
          'hover:bg-gray-200 dark:hover:bg-gray-700',
          'border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          sizeClasses[size],
          isAnimating && 'scale-95',
          className
        )}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {/* Sun Icon for Light Mode */}
        <div
          className={classNames(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            iconSizeClasses[size],
            theme === 'light' 
              ? 'opacity-100 rotate-0 text-yellow-500' 
              : 'opacity-0 -rotate-90 text-gray-400'
          )}
        >
          <div className="i-ph:sun-dim-duotone" />
        </div>

        {/* Moon Icon for Dark Mode */}
        <div
          className={classNames(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            iconSizeClasses[size],
            theme === 'dark' 
              ? 'opacity-100 rotate-0 text-blue-400' 
              : 'opacity-0 rotate-90 text-gray-400'
          )}
        >
          <div className="i-ph:moon-stars-duotone" />
        </div>

        {/* Animated background circle */}
        <div
          className={classNames(
            'absolute inset-1 rounded-full transition-all duration-300',
            theme === 'dark' 
              ? 'bg-gray-700 translate-x-0' 
              : 'bg-yellow-100 translate-x-full'
          )}
        />
      </button>
    );
  }

  // Advanced variant - with dropdown options
  if (variant === 'advanced') {
    return (
      <div className={classNames('relative', className)}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={classNames(
            'relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out',
            'bg-gray-100 dark:bg-gray-800',
            'hover:bg-gray-200 dark:hover:bg-gray-700',
            'border border-gray-200 dark:border-gray-700',
            'shadow-sm hover:shadow-md',
            'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
            sizeClasses[size],
            isAnimating && 'scale-95'
          )}
          title="Theme Options"
          aria-label="Theme Options"
        >
          <div className={classNames(iconSizeClasses[size], 'text-gray-600 dark:text-gray-300')}>
            <div className="i-ph:gear-six-duotone" />
          </div>
        </button>

        {/* Theme Options Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              <button
                onClick={() => handleThemeChange('light')}
                className={classNames(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'flex items-center gap-3',
                  theme === 'light' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                )}
              >
                <div className="w-4 h-4 text-yellow-500">
                  <div className="i-ph:sun-dim-duotone" />
                </div>
                Light Mode
              </button>
              
              <button
                onClick={() => handleThemeChange('dark')}
                className={classNames(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  'flex items-center gap-3',
                  theme === 'dark' && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                )}
              >
                <div className="w-4 h-4 text-blue-400">
                  <div className="i-ph:moon-stars-duotone" />
                </div>
                Dark Mode
              </button>
              
              {showSystemInfo && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                  
                  <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                    System: {systemTheme === 'dark' ? 'Dark' : 'Light'}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default toggle variant
  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <button
        onClick={handleToggle}
        className={classNames(
          'relative flex items-center justify-center rounded-full transition-all duration-300 ease-in-out',
          'bg-gray-100 dark:bg-gray-800',
          'hover:bg-gray-200 dark:hover:bg-gray-700',
          'border border-gray-200 dark:border-gray-700',
          'shadow-sm hover:shadow-md',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          sizeClasses[size],
          isAnimating && 'scale-95'
        )}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {/* Sun Icon for Light Mode */}
        <div
          className={classNames(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            iconSizeClasses[size],
            theme === 'light' 
              ? 'opacity-100 rotate-0 text-yellow-500' 
              : 'opacity-0 -rotate-90 text-gray-400'
          )}
        >
          <div className="i-ph:sun-dim-duotone" />
        </div>

        {/* Moon Icon for Dark Mode */}
        <div
          className={classNames(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            iconSizeClasses[size],
            theme === 'dark' 
              ? 'opacity-100 rotate-0 text-blue-400' 
              : 'opacity-0 rotate-90 text-gray-400'
          )}
        >
          <div className="i-ph:moon-stars-duotone" />
        </div>

        {/* Animated background circle */}
        <div
          className={classNames(
            'absolute inset-1 rounded-full transition-all duration-300',
            theme === 'dark' 
              ? 'bg-gray-700 translate-x-0' 
              : 'bg-yellow-100 translate-x-full'
          )}
        />
      </button>

      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {theme === 'dark' ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </div>
  );
});

ThemeSwitch.displayName = 'ThemeSwitch';
