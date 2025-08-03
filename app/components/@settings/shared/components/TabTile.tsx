import * as Tooltip from '@radix-ui/react-tooltip';
import { classNames } from '~/utils/classNames';
import type { TabVisibilityConfig } from '~/components/@settings/core/types';
import { TAB_LABELS, TAB_ICONS } from '~/components/@settings/core/constants';
import { GlowingEffect } from '~/components/ui/GlowingEffect';

interface TabTileProps {
  tab: TabVisibilityConfig;
  onClick?: () => void;
  isActive?: boolean;
  hasUpdate?: boolean;
  statusMessage?: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const TabTile: React.FC<TabTileProps> = ({
  tab,
  onClick,
  isActive,
  hasUpdate,
  statusMessage,
  description,
  isLoading,
  className,
  children,
}: TabTileProps) => {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className={classNames('h-full list-none', className || '')}>
            <div className="relative h-full rounded-2xl border border-gray-200 dark:border-gray-700 p-0.5">
              <GlowingEffect
                blur={0}
                borderWidth={1}
                spread={20}
                glow={true}
                disabled={false}
                proximity={40}
                inactiveZone={0.3}
                movementDuration={0.4}
              />
              <div
                onClick={onClick}
                className={classNames(
                  'relative flex flex-col items-center justify-center h-full p-4 rounded-2xl',
                  'bg-zinc-900 dark:bg-neutral-900',
                  'group cursor-pointer',
                  'hover:bg-purple-800/10 hover:ring-1 hover:ring-purple-500/50',
                  'transition-all duration-200 ease-out',
                  isActive ? 'bg-purple-500/10 dark:bg-purple-500/20' : '',
                  isLoading ? 'cursor-wait opacity-70 pointer-events-none' : '',
                )}
              >
                {/* Icon */}
                <div
                  className={classNames(
                    'relative',
                    'w-14 h-14',
                    'flex items-center justify-center',
                    'rounded-2xl',
                    'bg-gray-800 dark:bg-gray-700',
                    'ring-1 ring-gray-600 dark:ring-gray-600',
                    'group-hover:bg-purple-900/30 dark:group-hover:bg-purple-800/20',
                    'group-hover:ring-purple-500/50 dark:group-hover:ring-purple-400/50',
                    'transition-all duration-200 ease-out',
                    isActive ? 'bg-purple-500/20 dark:bg-purple-500/30 ring-purple-500/50 dark:ring-purple-400/50' : '',
                  )}
                >
                  <div
                    className={classNames(
                      TAB_ICONS[tab.id],
                      'w-7 h-7',
                      'text-gray-300 dark:text-gray-200',
                      'group-hover:text-purple-400 dark:group-hover:text-purple-300',
                      'transition-colors duration-200 ease-out',
                      isActive ? 'text-purple-400 dark:text-purple-300' : '',
                    )}
                  />
                </div>

                {/* Label and Description */}
                <div className="flex flex-col items-center mt-3 w-full">
                  <h3
                    className={classNames(
                      'text-sm font-semibold leading-snug mb-1',
                      'text-gray-200 dark:text-gray-100',
                      'group-hover:text-purple-300 dark:group-hover:text-purple-200',
                      'transition-colors duration-200 ease-out',
                      isActive ? 'text-purple-300 dark:text-purple-200' : '',
                    )}
                  >
                    {TAB_LABELS[tab.id]}
                  </h3>
                  {description && (
                    <p
                      className={classNames(
                        'text-xs leading-relaxed',
                        'text-gray-400 dark:text-gray-300',
                        'max-w-[95%]',
                        'text-center',
                        'group-hover:text-purple-400/80 dark:group-hover:text-purple-300/80',
                        'transition-colors duration-200 ease-out',
                        isActive ? 'text-purple-300/80 dark:text-purple-200/80' : '',
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>

                {/* Update Indicator with Tooltip */}
                {hasUpdate && (
                  <>
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className={classNames(
                          'px-3 py-1.5 rounded-lg',
                          'bg-[#18181B] text-white',
                          'text-sm font-medium',
                          'select-none',
                          'z-[100]',
                        )}
                        side="top"
                        sideOffset={5}
                      >
                        {statusMessage}
                        <Tooltip.Arrow className="fill-[#18181B]" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </>
                )}

                {/* Children (e.g. Beta Label) */}
                {children}
              </div>
            </div>
          </div>
        </Tooltip.Trigger>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
