import React from 'react';
import { classNames } from '~/utils/classNames';

const ServicesTab: React.FC = () => {
  const integrations = [
    {
      id: 'figma',
      name: 'Figma',
      description: 'Import designs from Figma',
      icon: 'i-ph:figma-logo',
      status: 'connected',
    },
    {
      id: 'stitch',
      name: 'Stitch',
      description: 'Import designs from Stitch',
      icon: 'i-ph:scissors',
      status: 'available',
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect to GitHub repositories',
      icon: 'i-ph:github-logo',
      status: 'connected',
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Deploy to Vercel',
      icon: 'i-ph:cloud-arrow-up',
      status: 'available',
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Deploy to Netlify',
      icon: 'i-ph:cloud-arrow-up',
      status: 'available',
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Database and backend services',
      icon: 'i-ph:database',
      status: 'connected',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Services & Integrations</h2>
        <p className="text-gray-400 text-sm">
          Manage all your integrations and external services in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={classNames(
              'p-4 rounded-lg border',
              'bg-gray-800 border-gray-700',
              'hover:bg-gray-700 hover:border-gray-600',
              'transition-all duration-200',
              'cursor-pointer'
            )}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                <div className={classNames(integration.icon, 'w-5 h-5 text-white')} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{integration.name}</h3>
                <p className="text-gray-400 text-sm">{integration.description}</p>
              </div>
              <div className="flex items-center">
                {integration.status === 'connected' && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
                {integration.status === 'available' && (
                  <div className="w-2 h-2 rounded-full bg-gray-500" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg bg-gray-800 border border-gray-700">
        <h3 className="text-white font-medium mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Add New Integration
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            View All Services
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesTab;