"use client";

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => 
    typeof window !== 'undefined' ? navigator.onLine : true
  );
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      // Ocultar mensaje restaurado después de 3 segundos
      setTimeout(() => setShowRestored(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-0 left-0 right-0 z-50 p-3 text-sm font-medium transition-all duration-500 ease-in-out flex items-center justify-center gap-2 ${
        !isOnline 
          ? 'bg-rose text-white translate-y-0' 
          : 'bg-green-600 text-white translate-y-0'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff size={16} />
          <span>Tu dispositivo está sin conexión. Revisa tu red.</span>
        </>
      ) : (
        <>
          <Wifi size={16} />
          <span>Conexión restablecida.</span>
        </>
      )}
    </div>
  );
}
