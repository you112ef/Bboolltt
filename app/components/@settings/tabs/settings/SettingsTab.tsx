import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';
import { Switch } from '~/components/ui/Switch';
import type { UserProfile } from '~/components/@settings/core/types';
import { isMac } from '~/utils/os';

// Helper to get modifier key symbols/text
const getModifierSymbol = (modifier: string): string => {
  switch (modifier) {
    case 'meta':
      return isMac ? '⌘' : 'Win';
    case 'alt':
      return isMac ? '⌥' : 'Alt';
    case 'shift':
      return '⇧';
    default:
      return modifier;
  }
};

// Settings categories with icons and descriptions
const SETTINGS_CATEGORIES = [
  {
    id: 'preferences',
    label: 'Preferences',
    icon: 'i-ph:palette-fill',
    description: 'Language and notification settings',
    beta: false,
  },
  {
    id: 'timezone',
    label: 'Time Settings',
    icon: 'i-ph:clock-fill',
    description: 'Configure timezone and date format',
    beta: false,
  },
  {
    id: 'keyboard',
    label: 'Keyboard Shortcuts',
    icon: 'i-ph:keyboard-fill',
    description: 'Customize keyboard shortcuts',
    beta: false,
  },
  {
    id: 'theme',
    label: 'Theme Settings',
    icon: 'i-ph:monitor-fill',
    description: 'Customize appearance and colors',
    beta: false,
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: 'i-ph:gauge-fill',
    description: 'Optimize application performance',
    beta: true,
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'i-ph:shield-fill',
    description: 'Manage security and privacy settings',
    beta: false,
  },
  {
    id: 'backup',
    label: 'Backup & Sync',
    icon: 'i-ph:cloud-arrow-up-fill',
    description: 'Configure backup and synchronization',
    beta: true,
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: 'i-ph:gear-six-fill',
    description: 'Advanced configuration options',
    beta: false,
  },
  {
    id: 'updates',
    label: 'Updates',
    icon: 'i-ph:arrow-clockwise-fill',
    description: 'Manage application updates',
    beta: false,
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: 'i-ph:question-circle-fill',
    description: 'Get help and contact support',
    beta: false,
  },
  {
    id: 'about',
    label: 'About',
    icon: 'i-ph:info-circle-fill',
    description: 'Application information and version',
    beta: false,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    icon: 'i-ph:chat-circle-fill',
    description: 'Send feedback and report issues',
    beta: false,
  },
];

const BetaLabel = () => (
  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-500/20">
    <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400">BETA</span>
  </div>
);

export default function SettingsTab() {
  const [currentTimezone, setCurrentTimezone] = useState('');
  const [settings, setSettings] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bolt_user_profile');
    return saved
      ? JSON.parse(saved)
      : {
          notifications: true,
          language: 'en',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
  });

  useEffect(() => {
    setCurrentTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  // Save settings automatically when they change
  useEffect(() => {
    try {
      // Get existing profile data
      const existingProfile = JSON.parse(localStorage.getItem('bolt_user_profile') || '{}');

      // Merge with new settings
      const updatedProfile = {
        ...existingProfile,
        notifications: settings.notifications,
        language: settings.language,
        timezone: settings.timezone,
      };

      localStorage.setItem('bolt_user_profile', JSON.stringify(updatedProfile));
      toast.success('Settings updated');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update settings');
    }
  }, [settings]);

  const handleCategoryClick = (categoryId: string) => {
    // Handle different category clicks
    switch (categoryId) {
      case 'preferences':
        // Could open a modal or navigate to preferences
        toast.info('Preferences settings');
        break;
      case 'timezone':
        toast.info('Timezone settings');
        break;
      case 'keyboard':
        toast.info('Keyboard shortcuts');
        break;
      case 'theme':
        toast.info('Theme settings');
        break;
      case 'performance':
        toast.info('Performance settings (BETA)');
        break;
      case 'security':
        toast.info('Security settings');
        break;
      case 'backup':
        toast.info('Backup & sync settings (BETA)');
        break;
      case 'advanced':
        toast.info('Advanced settings');
        break;
      case 'updates':
        toast.info('Update settings');
        break;
      case 'help':
        toast.info('Help & support');
        break;
      case 'about':
        toast.info('About application');
        break;
      case 'feedback':
        toast.info('Send feedback');
        break;
      default:
        toast.info(`${categoryId} settings`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Grid of Settings Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SETTINGS_CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            className="aspect-[1.5/1] transition-transform duration-100 ease-out hover:scale-[1.01]"
            style={{
              animationDelay: `${index * 30}ms`,
              animation: 'fadeInUp 200ms ease-out forwards',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="min-h-[160px] list-none h-full">
              <div className="relative h-full rounded-xl border border-[#E5E5E5] dark:border-[#333333] p-0.5">
                <div
                  onClick={() => handleCategoryClick(category.id)}
                  className={classNames(
                    'relative flex flex-col items-center justify-center h-full p-4 rounded-lg',
                    'bg-white dark:bg-[#141414]',
                    'group cursor-pointer',
                    'hover:bg-purple-50 dark:hover:bg-[#1a1a1a]',
                    'transition-colors duration-100 ease-out',
                  )}
                >
                  {/* Icon */}
                  <div
                    className={classNames(
                      'relative',
                      'w-14 h-14',
                      'flex items-center justify-center',
                      'rounded-xl',
                      'bg-gray-100 dark:bg-gray-800',
                      'ring-1 ring-gray-200 dark:ring-gray-700',
                      'group-hover:bg-purple-100 dark:group-hover:bg-gray-700/80',
                      'group-hover:ring-purple-200 dark:group-hover:ring-purple-800/30',
                      'transition-all duration-100 ease-out',
                    )}
                  >
                    <div
                      className={classNames(
                        category.icon,
                        'w-8 h-8',
                        'text-gray-600 dark:text-gray-300',
                        'group-hover:text-purple-500 dark:group-hover:text-purple-400/80',
                        'transition-colors duration-100 ease-out',
                      )}
                    />
                  </div>

                  {/* Label and Description */}
                  <div className="flex flex-col items-center mt-4 w-full">
                    <h3
                      className={classNames(
                        'text-[15px] font-medium leading-snug mb-2',
                        'text-gray-700 dark:text-gray-200',
                        'group-hover:text-purple-600 dark:group-hover:text-purple-300/90',
                        'transition-colors duration-100 ease-out',
                      )}
                    >
                      {category.label}
                    </h3>
                    <p
                      className={classNames(
                        'text-[13px] leading-relaxed',
                        'text-gray-500 dark:text-gray-400',
                        'max-w-[85%]',
                        'text-center',
                        'group-hover:text-purple-500 dark:group-hover:text-purple-400/70',
                        'transition-colors duration-100 ease-out',
                      )}
                    >
                      {category.description}
                    </p>
                  </div>

                  {/* Beta Label */}
                  {category.beta && <BetaLabel />}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Settings Section */}
      <motion.div
        className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-sm dark:shadow-none p-4 space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="i-ph:gear-six-fill w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">Quick Settings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language Setting */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="i-ph:translate-fill w-4 h-4 text-bolt-elements-textSecondary" />
              <label className="block text-sm text-bolt-elements-textSecondary">Language</label>
            </div>
            <select
              value={settings.language}
              onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
              className={classNames(
                'w-full px-3 py-2 rounded-lg text-sm',
                'bg-[#FAFAFA] dark:bg-[#0A0A0A]',
                'border border-[#E5E5E5] dark:border-[#1A1A1A]',
                'text-bolt-elements-textPrimary',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/30',
                'transition-all duration-200',
              )}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ru">Русский</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          {/* Notifications Setting */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="i-ph:bell-fill w-4 h-4 text-bolt-elements-textSecondary" />
              <label className="block text-sm text-bolt-elements-textSecondary">Notifications</label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-bolt-elements-textSecondary">
                {settings.notifications ? 'Notifications are enabled' : 'Notifications are disabled'}
              </span>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => {
                  // Update local state
                  setSettings((prev) => ({ ...prev, notifications: checked }));

                  // Update localStorage immediately
                  const existingProfile = JSON.parse(localStorage.getItem('bolt_user_profile') || '{}');
                  const updatedProfile = {
                    ...existingProfile,
                    notifications: checked,
                  };
                  localStorage.setItem('bolt_user_profile', JSON.stringify(updatedProfile));

                  // Dispatch storage event for other components
                  window.dispatchEvent(
                    new StorageEvent('storage', {
                      key: 'bolt_user_profile',
                      newValue: JSON.stringify(updatedProfile),
                    }),
                  );

                  toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
