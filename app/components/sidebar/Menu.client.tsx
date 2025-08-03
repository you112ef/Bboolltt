import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { streamingState } from '~/lib/stores/streaming';
import { classNames } from '~/utils/classNames';
import { CurrentDateTime } from './CurrentDateTime';
import { useState } from 'react';

export function Menu() {
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const isStreaming = useStore(streamingState);

  return (
    <div className="flex flex-col gap-1 sm:gap-2 p-2 sm:p-3 md:p-4">
      <div className="flex items-center justify-between gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm text-bolt-elements-textSecondary">
        <CurrentDateTime />
      </div>
      <div className="flex flex-col gap-1 sm:gap-2">
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm text-bolt-elements-textSecondary">
          <div className="i-ph:sidebar-simple-duotone h-3 w-3 sm:h-4 sm:w-4"></div>
          <span>Menu</span>
        </div>
      </div>
    </div>
  );
}
