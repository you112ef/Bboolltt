import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { streamingState } from '~/lib/stores/streaming';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { classNames } from '~/utils/classNames';
import { useChatHistory } from '~/lib/persistence';
import { useState } from 'react';

interface HeaderProps {
  chatStarted: boolean;
}

export function Header({ chatStarted }: HeaderProps) {
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const isStreaming = useStore(streamingState);
  const { exportChat } = useChatHistory();

  return (
    <header className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 bg-bolt-elements-background-depth-1 border-b border-bolt-elements-borderColor">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="i-bolt:bolt text-sm sm:text-base md:text-xl text-bolt-elements-textPrimary"></div>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-bolt-elements-textPrimary">Bolt</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <img
            src="/bolt-logo.png"
            alt="Bolt Logo"
            className="w-[60px] sm:w-[75px] md:w-[90px] h-auto"
          />
        </div>
        <div className="text-xs sm:text-sm md:text-base text-bolt-elements-textSecondary">
          AI-powered development platform
        </div>
      </div>
      <HeaderActionButtons chatStarted={chatStarted} />
    </header>
  );
}
