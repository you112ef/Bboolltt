import { useState } from 'react';
import { classNames } from '~/utils/classNames';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  badge?: string;
}

const services: ServiceItem[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect to GitHub repositories and manage code',
    icon: 'i-ph:github-logo',
    status: 'disconnected',
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy and manage projects on Vercel',
    icon: 'i-ph:cloud-arrow-up',
    status: 'disconnected',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Deploy and manage projects on Netlify',
    icon: 'i-ph:cloud-arrow-up',
    status: 'disconnected',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Connect to Supabase database and services',
    icon: 'i-ph:database',
    status: 'disconnected',
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Import designs and assets from Figma',
    icon: 'i-ph:paint-brush',
    status: 'disconnected',
  },
  {
    id: 'stitch',
    name: 'Stitch',
    description: 'Import designs and assets from Stitch',
    icon: 'i-ph:needle',
    status: 'disconnected',
  },
  {
    id: 'docker',
    name: 'Docker',
    description: 'Manage Docker containers and images',
    icon: 'i-ph:cube',
    status: 'disconnected',
  },
  {
    id: 'api-keys',
    name: 'API Keys',
    description: 'Manage API keys and tokens',
    icon: 'i-ph:key',
    status: 'disconnected',
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Configure webhook endpoints',
    icon: 'i-ph:link',
    status: 'disconnected',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View usage analytics and metrics',
    icon: 'i-ph:chart-line',
    status: 'disconnected',
  },
  {
    id: 'cloud-providers',
    name: 'Cloud Providers',
    description: 'Configure cloud AI providers and models',
    icon: 'i-ph:cloud',
    status: 'connected',
  },
  {
    id: 'local-providers',
    name: 'Local Providers',
    description: 'Configure local AI providers and models',
    icon: 'i-ph:laptop',
    status: 'connected',
    badge: 'BETA',
  },
];

const getStatusColor = (status: ServiceItem['status']) => {
  switch (status) {
    case 'connected':
      return 'bg-green-500';
    case 'disconnected':
      return 'bg-gray-400';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: ServiceItem['status']) => {
  switch (status) {
    case 'connected':
      return 'Connected';
    case 'disconnected':
      return 'Disconnected';
    case 'error':
      return 'Error';
    default:
      return 'Unknown';
  }
};

export default function ServicesTab() {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Services & Integrations</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all your external service connections and integrations
          </p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          Add Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={classNames(
              'relative p-4 rounded-xl border transition-all duration-200 cursor-pointer',
              'bg-white dark:bg-gray-800',
              'border-gray-200 dark:border-gray-700',
              'hover:border-purple-300 dark:hover:border-purple-600',
              'hover:shadow-md hover:scale-[1.02]',
              selectedService === service.id ? 'ring-2 ring-purple-500' : '',
            )}
            onClick={() => setSelectedService(service.id)}
          >
            {/* Status Indicator */}
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <div className={classNames('w-2 h-2 rounded-full', getStatusColor(service.status))} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{getStatusText(service.status)}</span>
            </div>

            {/* Badge */}
            {service.badge && (
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full">
                  {service.badge}
                </span>
              </div>
            )}

            {/* Icon */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <div className={classNames(service.icon, 'w-5 h-5 text-gray-600 dark:text-gray-300')} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{service.description}</p>

            {/* Action Button */}
            <div className="mt-4">
              <button
                className={classNames(
                  'w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  service.status === 'connected'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
                )}
              >
                {service.status === 'connected' ? 'Manage' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Service Details */}
      {selectedService && (
        <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Details</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Configuration options and settings for the selected service will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
