import * as Tooltip from '@radix-ui/react-tooltip';
import { classNames } from '~/utils/classNames';
import type { TabVisibilityConfig } from '~/components/@settings/core/types';
import { TAB_LABELS, TAB_ICONS } from '~/components/@settings/core/constants';

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
            <div className="relative h-full rounded-lg border border-gray-700 p-0.5">
              <div
                onClick={onClick}
                className={classNames(
                  'relative flex flex-col items-center justify-center h-full p-3 rounded-lg',
                  'bg-gray-800',
                  'group cursor-pointer',
                  'hover:bg-gray-700',
                  'transition-all duration-200 ease-out',
                  isActive ? 'bg-gray-700' : '',
                  isLoading ? 'cursor-wait opacity-70 pointer-events-none' : '',
                )}
              >
                {/* Icon */}
                <div
                  className={classNames(
                    'relative',
                    'w-10 h-10',
                    'flex items-center justify-center',
                    'rounded-lg',
                    'bg-gray-700',
                    'group-hover:bg-gray-600',
                    'transition-all duration-200 ease-out',
                    isActive ? 'bg-gray-600' : '',
                  )}
                >
                  <div
                    className={classNames(
                      TAB_ICONS[tab.id],
                      'w-5 h-5',
                      'text-white',
                      'group-hover:text-white',
                      'transition-colors duration-200 ease-out',
                      isActive ? 'text-white' : '',
                    )}
                  />
                </div>

                {/* Label */}
                <div className="flex flex-col items-center mt-2 w-full">
                  <h3
                    className={classNames(
                      'text-[13px] font-medium leading-snug',
                      'text-white',
                      'group-hover:text-white',
                      'transition-colors duration-200 ease-out',
                      isActive ? 'text-white' : '',
                    )}
                  >
                    {TAB_LABELS[tab.id]}
                  </h3>
                </div>

                {/* Update Indicator with Tooltip */}
                {hasUpdate && (
                  <>
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
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

                {/* Features dot indicator */}
                {tab.id === 'features' && (
                  <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-purple-500" />
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
