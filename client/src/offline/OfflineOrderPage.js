// OfflineOrderPage.js
import React, { useState } from 'react';
import { useOfflineOrders } from '../hooks/useOfflineOrders';
import './OfflineOrderPage.css';
import CigarOrderList3 from '../components/CigarOrderList3';
import Home from '../pages/Home';

const OfflineOrderPage = () => {
  const [catalogType, setCatalogType] = useState('domestic');
  const [orderItems, setOrderItems] = useState([]);
  const { isOnline, saveOfflineOrder } = useOfflineOrders();

  const getCatalogData = () => {
    const catalogData = JSON.parse(localStorage.getItem('cigarCatalog') || '{"cigars": []}');
    return catalogType === 'domestic' ? catalogData.cigars : catalogData.intlCigars;
  };

  const cigars = getCatalogData();

  const handleQuantityChange = (cigar, quantity) => {
    const newQuantity = parseInt(quantity) || 0;
    
    if (newQuantity === 0) {
      setOrderItems(orderItems.filter(item => item.cigar._id !== cigar._id));
      return;
    }

    const existingItemIndex = orderItems.findIndex(
      item => item.cigar._id === cigar._id
    );

    if (existingItemIndex >= 0) {
      const newOrderItems = [...orderItems];
      newOrderItems[existingItemIndex] = { cigar, quantity: newQuantity };
      setOrderItems(newOrderItems);
    } else {
      setOrderItems([...orderItems, { cigar, quantity: newQuantity }]);
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.cigar.priceBox * item.quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    if (orderItems.length === 0) {
      alert('Please add items to your order');
      return;
    }

    const orderData = {
      items: orderItems,
      total: calculateTotal(),
      timestamp: new Date().toISOString(),
      catalogType
    };

    try {
      if (isOnline) {
        // Submit order to server (implementation not shown)
        alert('Order submitted successfully!');
      } else {
        await saveOfflineOrder(orderData);
        alert('Order saved offline. You can submit it when you reconnect.');
      }
    } catch (error) {
      alert('Error saving order: ' + error.message);
    }
  };

  return (
    <div className="order-page">
        <Home offline />
    </div>
  );
};

export default OfflineOrderPage;