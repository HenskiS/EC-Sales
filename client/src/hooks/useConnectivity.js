import { useEffect, useState } from "react";

const useConnectivity = (pingEndpoint = '/api/ping') => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isServerAvailable, setIsServerAvailable] = useState(true);

    // Check server availability
    const checkServer = async () => {
      try {
        const response = await fetch(pingEndpoint, {
          method: 'HEAD',  // Use HEAD request for efficiency
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        setIsServerAvailable(response.ok);
      } catch (error) {
        setIsServerAvailable(false);
      }
    };
  
    useEffect(() => {
      // Initial check
      checkServer();
  
      // Set up event listeners for online/offline status
      const handleOnline = () => {
        setIsOnline(true);
        checkServer();  // Recheck server when we come online
      };
  
      const handleOffline = () => {
        setIsOnline(false);
        setIsServerAvailable(false);
      };
  
      // Set up periodic server checking when online
      let intervalId;
      if (isOnline) {
        intervalId = setInterval(checkServer, 30000); // Check every 30 seconds
      }
  
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
  
      // Cleanup
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        if (intervalId) clearInterval(intervalId);
      };
    }, [pingEndpoint, isOnline]);
  
    return {
      isOnline,
      isServerAvailable,
      isConnected: isOnline && isServerAvailable
    };
};

export default useConnectivity