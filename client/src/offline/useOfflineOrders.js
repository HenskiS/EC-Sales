import { useState, useEffect } from 'react';
import { openDB } from 'idb';

export const useOfflineOrders = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineOrders, setOfflineOrders] = useState([]);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load saved orders on mount
  useEffect(() => {
    const loadOfflineOrders = async () => {
      try {
        const db = await openDB('cigarStore', 1, {
          upgrade(db) {
            db.createObjectStore('offlineOrders', { keyPath: 'id' });
          }
        });
        const orders = await db.getAll('offlineOrders');
        setOfflineOrders(orders);
      } catch (error) {
        console.error('Failed to load offline orders:', error);
      }
    };

    loadOfflineOrders();
  }, []);

  const saveOfflineOrder = async (orderData) => {
    try {
      const db = await openDB('cigarStore', 1);
      const order = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        status: 'pending',
        ...orderData
      };

      await db.add('offlineOrders', order);
      setOfflineOrders(prev => [...prev, order]);
      
      return order;
    } catch (error) {
      console.error('Failed to save offline order:', error);
      throw error;
    }
  };

  const deleteOfflineOrder = async (orderId) => {
    try {
      const db = await openDB('cigarStore', 1);
      await db.delete('offlineOrders', orderId);
      setOfflineOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Failed to delete offline order:', error);
      throw error;
    }
  };

  return {
    isOnline,
    offlineOrders,
    saveOfflineOrder,
    deleteOfflineOrder
  };
};
