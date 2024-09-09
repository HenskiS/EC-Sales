import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import './assets/Navbar.css';
import './assets/card.css';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <OrderProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
      </BrowserRouter>
      </OrderProvider>
    </AuthProvider>
  </React.StrictMode>
);

