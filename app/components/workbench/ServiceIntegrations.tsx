import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '~/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Progress } from '~/components/ui/Progress';
import { DeploymentModal } from '~/components/deploy/DeploymentModal';
import {
  CloudArrowUpIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  DocumentArrowDownIcon,
  ServerIcon,
  CircleStackIcon,
  FireIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface ServiceIntegrationsProps {
  projectFiles: Record<string, string>;
  projectName: string;
  onServiceAction?: (service: string, action: string) => void;
}

interface ServiceStatus {
  id: string;
  name: string;
  status: 'available' | 'configuring' | 'deployed' | 'error';
  url?: string;
  lastDeployed?: Date;
}

export function ServiceIntegrations({
  projectFiles,
  projectName,
  onServiceAction: _onServiceAction,
}: ServiceIntegrationsProps) {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});
  const [activeOperations, setActiveOperations] = useState<Set<string>>(new Set());

  // Available services configuration
  const services = {
    deployment: [
      {
        id: 'vercel',
        name: 'Vercel',
        icon: <CloudArrowUpIcon className="h-6 w-6" />,
        description: 'Deploy to Vercel with automatic HTTPS and CDN',
        color: 'bg-black text-white',
        features: ['Automatic HTTPS', 'Global CDN', 'Serverless Functions'],
      },
      {
        id: 'netlify',
        name: 'Netlify',
        icon: <CloudArrowUpIcon className="h-6 w-6" />,
        description: 'Deploy to Netlify with continuous deployment',
        color: 'bg-teal-500 text-white',
        features: ['Continuous Deployment', 'Form Handling', 'Edge Functions'],
      },
      {
        id: 'firebase',
        name: 'Firebase',
        icon: <FireIcon className="h-6 w-6" />,
        description: 'Deploy to Firebase Hosting with real-time features',
        color: 'bg-orange-500 text-white',
        features: ['Real-time Database', 'Authentication', 'Cloud Functions'],
      },
      {
        id: 'github-pages',
        name: 'GitHub Pages',
        icon: <CodeBracketIcon className="h-6 w-6" />,
        description: 'Deploy to GitHub Pages for free static hosting',
        color: 'bg-gray-800 text-white',
        features: ['Free Hosting', 'Custom Domains', 'GitHub Integration'],
      },
    ],
    containerization: [
      {
        id: 'docker',
        name: 'Docker',
        icon: <CubeIcon className="h-6 w-6" />,
        description: 'Create production-ready Docker containers',
        color: 'bg-blue-500 text-white',
        features: ['Multi-stage Builds', 'Production Optimized', 'Cross-platform'],
      },
    ],
    mobile: [
      {
        id: 'expo',
        name: 'Expo',
        icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
        description: 'Build and deploy mobile apps with Expo',
        color: 'bg-purple-600 text-white',
        features: ['React Native', 'OTA Updates', 'App Store Ready'],
      },
      {
        id: 'android-apk',
        name: 'Android APK',
        icon: <DevicePhoneMobileIcon className="h-6 w-6" />,
        description: 'Generate native Android APK files',
        color: 'bg-green-600 text-white',
        features: ['Native Performance', 'Offline Support', 'Play Store Ready'],
      },
    ],
    backend: [
      {
        id: 'express',
        name: 'Express.js',
        icon: <ServerIcon className="h-6 w-6" />,
        description: 'Fast, unopinionated web framework for Node.js',
        color: 'bg-gray-700 text-white',
        features: ['Minimal', 'Flexible', 'Robust'],
      },
      {
        id: 'fastify',
        name: 'Fastify',
        icon: <ServerIcon className="h-6 w-6" />,
        description: 'Fast and low overhead web framework',
        color: 'bg-black text-white',
        features: ['High Performance', 'Schema Based', 'Plugin Architecture'],
      },
    ],
    storage: [
      {
        id: 'aws-s3',
        name: 'AWS S3',
        icon: <CircleStackIcon className="h-6 w-6" />,
        description: 'Scalable object storage with AWS S3',
        color: 'bg-orange-600 text-white',
        features: ['Scalable', 'Durable', 'Cost-effective'],
      },
      {
        id: 'cloudinary',
        name: 'Cloudinary',
        icon: <CircleStackIcon className="h-6 w-6" />,
        description: 'Media management and optimization',
        color: 'bg-blue-600 text-white',
        features: ['Image Optimization', 'Video Processing', 'CDN'],
      },
      {
        id: 'supabase',
        name: 'Supabase Storage',
        icon: <CircleStackIcon className="h-6 w-6" />,
        description: 'Open source Firebase alternative',
        color: 'bg-green-500 text-white',
        features: ['Real-time', 'PostgreSQL', 'Authentication'],
      },
    ],
    export: [
      {
        id: 'zip-export',
        name: 'ZIP Export',
        icon: <DocumentArrowDownIcon className="h-6 w-6" />,
        description: 'Download complete project as ZIP archive',
        color: 'bg-indigo-500 text-white',
        features: ['Complete Project', 'Compressed', 'Ready to Deploy'],
      },
    ],
    design: [
      {
        id: 'figma-import',
        name: 'Figma Import',
        icon: <PaintBrushIcon className="h-6 w-6" />,
        description: 'Import designs and components from Figma',
        color: 'bg-purple-500 text-white',
        features: ['Design Tokens', 'Components', 'Assets Export'],
      },
      {
        id: 'stitch-import',
        name: 'Stitch Import',
        icon: <SwatchIcon className="h-6 w-6" />,
        description: 'Import design system from Stitch',
        color: 'bg-pink-500 text-white',
        features: ['Design Tokens', 'Theme Config', 'Component Variants'],
      },
    ],
  };

  // Handle service deployment
  const handleDeploy = async (serviceId: string) => {
    setActiveOperations((prev) => new Set([...prev, serviceId]));

    try {
      let response;

      switch (serviceId) {
        case 'vercel':
          response = await fetch('/api/vercel-deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectFiles, projectName }),
          });
          break;

        case 'netlify':
          response = await fetch('/api/netlify-deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectFiles, projectName }),
          });
          break;

        case 'docker':
          response = await fetch('/api/docker-build', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectFiles, projectName }),
          });
          break;

        case 'android-apk':
          response = await fetch('/api/android-build', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectFiles,
              appName: projectName,
              packageName: `com.${projectName.toLowerCase().replace(/\s+/g, '')}.app`,
              versionName: '1.0.0',
              versionCode: 1,
              buildType: 'debug',
            }),
          });
          break;

        case 'figma-import': {
          const figmaUrl = prompt('Enter Figma URL:');
          const figmaToken = prompt('Enter Figma Access Token:');

          if (figmaUrl && figmaToken) {
            response = await fetch('/api/figma-import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                figmaUrl,
                accessToken: figmaToken,
                includeAssets: true,
                generateComponents: true,
                framework: 'react',
                cssFramework: 'tailwind',
              }),
            });
          } else {
            throw new Error('Figma URL and access token are required');
          }

          break;
        }

        case 'stitch-import': {
          const stitchUrl = prompt('Enter Stitch Project URL:');
          const stitchToken = prompt('Enter Stitch Access Token:');

          if (stitchUrl && stitchToken) {
            response = await fetch('/api/stitch-import', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                stitchUrl,
                accessToken: stitchToken,
                includeTokens: true,
                generateTheme: true,
                framework: 'react',
                cssFramework: 'stitches',
              }),
            });
          } else {
            throw new Error('Stitch URL and access token are required');
          }

          break;
        }

        default:
          throw new Error(`Service ${serviceId} not implemented`);
      }

      if (!response?.ok) {
        throw new Error(`Deployment failed: ${response?.statusText}`);
      }

      const result = (await response.json()) as any;

      if (result.success) {
        setServiceStatuses((prev) => ({
          ...prev,
          [serviceId]: {
            id: serviceId,
            name: services.deployment.find((s) => s.id === serviceId)?.name || serviceId,
            status: 'deployed',
            url: result.downloadUrl || result.url,
            lastDeployed: new Date(),
          },
        }));

        toast.success(`Successfully deployed to ${serviceId}!`);

        // Auto-download for build services
        if (result.downloadUrl && (serviceId === 'docker' || serviceId === 'android-apk')) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = `${projectName}-${serviceId}.zip`;
          link.click();
        }
      } else {
        throw new Error(result.error || 'Deployment failed');
      }
    } catch (error) {
      console.error(`${serviceId} deployment error:`, error);
      setServiceStatuses((prev) => ({
        ...prev,
        [serviceId]: {
          id: serviceId,
          name: services.deployment.find((s) => s.id === serviceId)?.name || serviceId,
          status: 'error',
          lastDeployed: new Date(),
        },
      }));

      toast.error(`Deployment to ${serviceId} failed: ${error}`);
    } finally {
      setActiveOperations((prev) => {
        const next = new Set(prev);
        next.delete(serviceId);

        return next;
      });
    }
  };

  // Handle export
  const handleExport = async (format: string) => {
    setActiveOperations((prev) => new Set([...prev, 'export']));

    try {
      const response = await fetch('/api/enhanced-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectFiles,
          projectName,
          exportFormat: format,
          generateReadme: true,
          addGitignore: true,
          addLicense: 'MIT',
          optimizeAssets: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = (await response.json()) as any;

      if (result.success) {
        // Download the exported file
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename;
        link.click();

        toast.success(
          `Project exported successfully! (${result.metadata.fileCount} files, ${(result.size / 1024 / 1024).toFixed(2)} MB)`,
        );
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error}`);
    } finally {
      setActiveOperations((prev) => {
        const next = new Set(prev);
        next.delete('export');

        return next;
      });
    }
  };

  const renderServiceSection = (title: string, serviceList: any[], category: string) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-bolt-elements-textPrimary flex items-center gap-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceList.map((service) => {
          const isActive = activeOperations.has(service.id);
          const status = serviceStatuses[service.id];

          return (
            <motion.div key={service.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-2 rounded-lg ${service.color}`}>{service.icon}</div>
                    {status && (
                      <Badge
                        variant={
                          status.status === 'deployed' ? 'success' : status.status === 'error' ? 'danger' : 'primary'
                        }
                        size="sm"
                      >
                        {status.status}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base">{service.name}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {service.features.map((feature: string, index: number) => (
                        <Badge key={index} variant="subtle" size="sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {isActive && (
                      <div className="space-y-2">
                        <Progress value={Math.random() * 100} className="h-2" />
                        <p className="text-xs text-bolt-elements-textSecondary">Processing...</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {category === 'export' ? (
                        <Button size="sm" onClick={() => handleExport('zip')} disabled={isActive} className="flex-1">
                          {isActive ? 'Exporting...' : 'Export'}
                        </Button>
                      ) : category === 'design' ? (
                        <Button
                          size="sm"
                          onClick={() => handleDeploy(service.id)}
                          disabled={isActive}
                          className="flex-1"
                        >
                          {isActive ? 'Importing...' : 'Import'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleDeploy(service.id)}
                          disabled={isActive}
                          className="flex-1"
                        >
                          {isActive ? 'Deploying...' : 'Deploy'}
                        </Button>
                      )}

                      {status?.url && (
                        <Button size="sm" variant="outline" onClick={() => window.open(status.url, '_blank')}>
                          View
                        </Button>
                      )}
                    </div>

                    {status?.lastDeployed && (
                      <p className="text-xs text-bolt-elements-textSecondary">
                        Last: {status.lastDeployed.toLocaleString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">Service Integrations</h2>
        <p className="text-bolt-elements-textSecondary">
          Deploy, build, and integrate your project with various services
        </p>
      </div>

      {renderServiceSection('🚀 Deployment Services', services.deployment, 'deployment')}
      {renderServiceSection('🐳 Containerization', services.containerization, 'containerization')}
      {renderServiceSection('📱 Mobile Development', services.mobile, 'mobile')}
      {renderServiceSection('⚡ Backend Services', services.backend, 'backend')}
      {renderServiceSection('💾 Storage Services', services.storage, 'storage')}
      {renderServiceSection('🎨 Design Import', services.design, 'design')}
      {renderServiceSection('📦 Export Options', services.export, 'export')}

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        projectName={projectName}
        services={[]}
        onDeploy={handleDeploy}
        onExport={handleExport}
      />
    </div>
  );
}
