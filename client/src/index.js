import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/index.css';
import './assets/Navbar.css';
import './assets/card.css';
import App from './App';
import { AuthProvider } from './context/AuthProvider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CigarProvider } from './context/CigarsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <CigarProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
      </BrowserRouter>
      </CigarProvider>
    </AuthProvider>
  </React.StrictMode>
);

