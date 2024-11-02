import React from 'react'
import { useOfflineOrders } from './useOfflineOrders';

const OfflineOrderPage = () => {
    const { isOnline, saveOfflineOrder } = useOfflineOrders();
    const submitOrder = () => {
        console.log("Submit!")
        // Add logic
    }

    const handleSubmit = async (formData) => {
        if (isOnline) {
            await submitOrder(formData);
        } else {
            await saveOfflineOrder(formData);
            alert('Order saved offline. You can submit it when you reconnect.');
        }
    };
    return (
        <div>OfflineOrderPage
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}

export default OfflineOrderPage