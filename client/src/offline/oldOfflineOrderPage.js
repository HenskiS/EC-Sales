// OfflineOrderPage.js
import React, { useState } from 'react';
import { useOfflineOrders } from './useOfflineOrders';
import './OfflineOrderPage.css';

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
      <h1 className="page-title">Cigar Order Form</h1>
      
      <div className="catalog-selector">
        <label className="radio-label">
          <input
            type="radio"
            value="domestic"
            checked={catalogType === 'domestic'}
            onChange={(e) => setCatalogType(e.target.value)}
          />
          Domestic Cigars
        </label>
        <label className="radio-label">
          <input
            type="radio"
            value="international"
            checked={catalogType === 'international'}
            onChange={(e) => setCatalogType(e.target.value)}
          />
          International Cigars
        </label>
      </div>

      <div className="catalog-table">
        <table>
          <thead>
            <tr>
              <th>Brand & Name</th>
              <th>Blend</th>
              <th>Size</th>
              <th>Price (Box)</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {cigars.map((cigar) => {
              const orderItem = orderItems.find(
                item => item.cigar._id === cigar._id
              );
              return (
                <tr key={cigar._id}>
                  <td>{cigar.brandAndName}</td>
                  <td>{cigar.blend}</td>
                  <td>{cigar.sizeName}</td>
                  <td className="price">${cigar.priceBox.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={orderItem?.quantity || ''}
                      onChange={(e) => handleQuantityChange(cigar, e.target.value)}
                      className="quantity-input"
                      placeholder="0"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orderItems.length > 0 && (
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {orderItems.map(({ cigar, quantity }) => (
              <div key={cigar._id} className="summary-item">
                <span>{cigar.brandAndName} ({quantity} boxes)</span>
                <span>${(cigar.priceBox * quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="total">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="submit-button"
      >
        {isOnline ? 'Submit Order' : 'Save Order Offline'}
      </button>
    </div>
  );
};

export default OfflineOrderPage;