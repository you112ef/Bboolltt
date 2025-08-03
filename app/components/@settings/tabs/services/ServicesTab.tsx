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
      price: 'Free',
      features: ['Design Import', 'Component Sync', 'Real-time Updates']
    },
    {
      id: 'stitch',
      name: 'Stitch',
      description: 'Import designs from Stitch',
      icon: 'i-ph:scissors',
      status: 'available',
      price: 'Free',
      features: ['Design Import', 'Asset Management']
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect to GitHub repositories',
      icon: 'i-ph:github-logo',
      status: 'connected',
      price: 'Free',
      features: ['Repository Sync', 'Code Import', 'Version Control']
    },
    {
      id: 'vercel',
      name: 'Vercel',
      description: 'Deploy to Vercel',
      icon: 'i-ph:cloud-arrow-up',
      status: 'available',
      price: 'Free',
      features: ['Auto Deploy', 'Preview URLs', 'Analytics']
    },
    {
      id: 'netlify',
      name: 'Netlify',
      description: 'Deploy to Netlify',
      icon: 'i-ph:cloud-arrow-up',
      status: 'available',
      price: 'Free',
      features: ['Auto Deploy', 'Form Handling', 'Functions']
    },
    {
      id: 'supabase',
      name: 'Supabase',
      description: 'Database and backend services',
      icon: 'i-ph:database',
      status: 'connected',
      price: 'Free',
      features: ['Database', 'Auth', 'Real-time']
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'AI and language models',
      icon: 'i-ph:brain',
      status: 'connected',
      price: 'Paid',
      features: ['GPT-4', 'DALL-E', 'Whisper']
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude AI models',
      icon: 'i-ph:robot',
      status: 'available',
      price: 'Paid',
      features: ['Claude-3', 'Claude-2', 'Sonnet']
    },
    {
      id: 'google',
      name: 'Google AI',
      description: 'Google AI services',
      icon: 'i-ph:google-logo',
      status: 'available',
      price: 'Paid',
      features: ['Gemini', 'PaLM', 'Vertex AI']
    },
    {
      id: 'aws',
      name: 'AWS',
      description: 'Amazon Web Services',
      icon: 'i-ph:cloud',
      status: 'available',
      price: 'Paid',
      features: ['Lambda', 'S3', 'DynamoDB']
    },
    {
      id: 'azure',
      name: 'Azure',
      description: 'Microsoft Azure services',
      icon: 'i-ph:cloud',
      status: 'available',
      price: 'Paid',
      features: ['Functions', 'Blob Storage', 'Cosmos DB']
    },
    {
      id: 'firebase',
      name: 'Firebase',
      description: 'Google Firebase services',
      icon: 'i-ph:flame',
      status: 'available',
      price: 'Free',
      features: ['Firestore', 'Auth', 'Hosting']
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white mb-1 sm:mb-2">Services & Integrations</h2>
        <p className="text-xs sm:text-sm text-gray-400 leading-tight">
          Manage all your integrations and external services in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className={classNames(
              'p-2 sm:p-3 md:p-4 rounded-md sm:rounded-lg border',
              'bg-gray-800 border-gray-700',
              'hover:bg-gray-700 hover:border-gray-600',
              'transition-all duration-200',
              'cursor-pointer'
            )}
          >
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                <div className={classNames(integration.icon, 'w-4 h-4 sm:w-5 sm:h-5 text-white')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs sm:text-sm font-medium text-white truncate">{integration.name}</h3>
                  <div className="flex items-center space-x-1">
                    {integration.status === 'connected' && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                    )}
                    {integration.status === 'available' && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-500" />
                    )}
                    <span className={classNames(
                      'text-[8px] sm:text-[10px] font-medium px-1 py-0.5 rounded',
                      integration.price === 'Free' ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
                    )}>
                      {integration.price}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 leading-tight mb-1">{integration.description}</p>
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 2).map((feature, index) => (
                    <span key={index} className="text-[8px] sm:text-[10px] bg-gray-700 text-gray-300 px-1 py-0.5 rounded">
                      {feature}
                    </span>
                  ))}
                  {integration.features.length > 2 && (
                    <span className="text-[8px] sm:text-[10px] bg-gray-700 text-gray-300 px-1 py-0.5 rounded">
                      +{integration.features.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-md sm:rounded-lg bg-gray-800 border border-gray-700">
        <h3 className="text-sm sm:text-base font-medium text-white mb-2 sm:mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button className="px-2 py-1.5 sm:px-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm rounded-md transition-colors">
            Add Integration
          </button>
          <button className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs sm:text-sm rounded-md transition-colors">
            View All
          </button>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-md sm:rounded-lg bg-gray-800 border border-gray-700">
        <h3 className="text-sm sm:text-base font-medium text-white mb-2 sm:mb-3">Usage Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">12</div>
            <div className="text-[10px] sm:text-xs text-gray-400">Connected</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">8</div>
            <div className="text-[10px] sm:text-xs text-gray-400">Available</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">3</div>
            <div className="text-[10px] sm:text-xs text-gray-400">Paid</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-white">9</div>
            <div className="text-[10px] sm:text-xs text-gray-400">Free</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesTab;