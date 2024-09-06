import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import './assets/Navbar.css';
import './assets/card.css';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import { OfflineProvider } from './offline/OfflineContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <OrderProvider>
      <OfflineProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
      </BrowserRouter>
      </OfflineProvider>
      </OrderProvider>
    </AuthProvider>
  </React.StrictMode>
);

