import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { Progress } from '~/components/ui/Progress';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

export interface DeploymentService {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'idle' | 'deploying' | 'success' | 'error';
  url?: string;
  qrCode?: string;
  buildTime?: number;
}

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  services: DeploymentService[];
  onDeploy: (serviceId: string) => Promise<{ url?: string } | void>;
  onExport: (format: string) => Promise<void>;
}

export function DeploymentModal({
  isOpen,
  onClose,
  projectName,
  services: _services,
  onDeploy,
  onExport,
}: DeploymentModalProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [deploymentProgress, setDeploymentProgress] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string>('');

  const deploymentServices = [
    { id: 'vercel', name: 'Vercel', icon: '🚀', description: 'Deploy to Vercel with automatic HTTPS' },
    { id: 'netlify', name: 'Netlify', icon: '🌐', description: 'Deploy to Netlify with continuous deployment' },
    { id: 'github', name: 'GitHub Pages', icon: '📱', description: 'Deploy to GitHub Pages for free hosting' },
    { id: 'firebase', name: 'Firebase', icon: '🔥', description: 'Deploy to Firebase Hosting with CDN' },
    { id: 'expo', name: 'Expo', icon: '📲', description: 'Build and deploy mobile app with Expo' },
    { id: 'docker', name: 'Docker', icon: '🐳', description: 'Create Docker container for deployment' },
    { id: 'apk', name: 'Android APK', icon: '🤖', description: 'Build native Android APK file' },
  ];

  const exportFormats = [
    { id: 'zip', name: 'ZIP Archive', icon: '📦', description: 'Download complete project as ZIP' },
    { id: 'tar', name: 'TAR Archive', icon: '📄', description: 'Download project as TAR archive' },
    { id: 'git', name: 'Git Repository', icon: '🔄', description: 'Export as Git repository' },
  ];

  const handleDeploy = async (serviceId: string) => {
    setSelectedService(serviceId);
    setDeploymentProgress(null);

    try {
      const result = (await onDeploy(serviceId)) || {};
      setDeploymentProgress(100);
      setShowSuccess(true);

      if (result.url) {
        setDeployedUrl(result.url);
      }

      toast.success(`Successfully deployed to ${deploymentServices.find((s) => s.id === serviceId)?.name}!`);
    } catch (error) {
      toast.error(`Deployment failed: ${error}`);
      setSelectedService(null);
      setDeploymentProgress(null);
    }
  };

  const handleExport = async (format: string) => {
    try {
      await onExport(format);
      toast.success(`Project exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Export failed: ${error}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('URL copied to clipboard!');
  };

  return (
    <RadixDialog.Root open={isOpen} onOpenChange={onClose}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-[10000] max-h-[90vh] w-[90vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-bolt-elements-background-depth-1 p-6 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {!showSuccess ? (
                <motion.div
                  key="deployment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-bolt-elements-textSecondary mb-4" />
                    <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">Deploy Your Project</h2>
                    <p className="text-bolt-elements-textSecondary">Choose a deployment service or export your project</p>
                  </div>

                  {selectedService && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span>Deploying to {deploymentServices.find((s) => s.id === selectedService)?.name}</span>
                          <Badge variant="primary">In Progress</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress value={deploymentProgress ?? 0} className="mb-2" />
                        <p className="text-sm text-bolt-elements-textSecondary">
                          {deploymentProgress === null && 'Preparing deployment...'}
                          {deploymentProgress === 100 && 'Finalizing deployment...'}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">Deployment Services</h3>
                      <div className="space-y-3">
                        {deploymentServices.map((service) => (
                          <Card
                            key={service.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedService === service.id ? 'ring-2 ring-bolt-elements-borderColorActive' : ''
                            }`}
                            onClick={() => !selectedService && handleDeploy(service.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{service.icon}</span>
                                <div className="flex-1">
                                  <h4 className="font-medium text-bolt-elements-textPrimary">{service.name}</h4>
                                  <p className="text-sm text-bolt-elements-textSecondary">{service.description}</p>
                                </div>
                                {selectedService === service.id && (
                                  <div className="animate-spin h-5 w-5 border-2 border-bolt-elements-borderColor border-t-bolt-elements-textPrimary rounded-full" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-4">Export Options</h3>
                      <div className="space-y-3">
                        {exportFormats.map((format) => (
                          <Card key={format.id} className="cursor-pointer transition-all hover:shadow-md" onClick={() => handleExport(format.id)}>
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{format.icon}</span>
                                <div className="flex-1">
                                  <h4 className="font-medium text-bolt-elements-textPrimary">{format.name}</h4>
                                  <p className="text-sm text-bolt-elements-textSecondary">{format.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-2">Deployment Successful</h2>
                    <p className="text-bolt-elements-textSecondary">Your project has been deployed successfully.</p>
                  </div>

                  {deployedUrl && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GlobeAltIcon className="h-5 w-5" />
                          Deployment URL
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between gap-4">
                          <a href={deployedUrl} target="_blank" rel="noreferrer" className="text-bolt-elements-textPrimary underline break-all">
                            {deployedUrl}
                          </a>
                          <div className="flex items-center gap-2">
                            <Button variant="secondary" onClick={() => copyToClipboard(deployedUrl)}>
                              <DocumentDuplicateIcon className="h-4 w-4 mr-1" /> Copy
                            </Button>
                            <Button onClick={() => window.open(deployedUrl, '_blank', 'noopener,noreferrer')}>Open</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => window.location.reload()}>
                      New Deployment
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
