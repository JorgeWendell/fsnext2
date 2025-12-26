"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <Alert className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 max-w-md border-orange-500 bg-orange-50 dark:bg-orange-950">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>Modo Offline</AlertTitle>
      <AlertDescription>
        Você está offline. Algumas funcionalidades podem estar limitadas. Os
        dados serão sincronizados quando a conexão for restaurada.
      </AlertDescription>
    </Alert>
  );
}

