import { memo } from 'react';
import { Button } from '~/components/ui/Button';

interface SettingsButtonProps {
  onClick: () => void;
}

export const SettingsButton = memo(({ onClick }: SettingsButtonProps) => {
  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="ghost"
      title="Settings"
      data-testid="settings-button"
      className="text-[#666] hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive/10 transition-colors"
    >
      <div className="i-ph:gear w-4 h-4" />
    </Button>
  );
});
