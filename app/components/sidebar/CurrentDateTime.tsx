import { useEffect, useState } from 'react';

export function CurrentDateTime() {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800/50">
      <div className="h-3 w-3 sm:h-4 sm:w-4 i-ph:clock opacity-80" />
      <div className="flex gap-1 sm:gap-2">
        <span>{dateTime.toLocaleDateString()}</span>
        <span>{dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}