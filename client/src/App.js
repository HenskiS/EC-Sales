import Navbar from './pages/navbar/Navbar';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Photos from './pages/Photos';
import RepPersonal from './pages/RepPersonal';
import ClientList from './pages/ClientList';
import Auth from './pages/Auth';
import useToken from './hooks/useToken';
import ShowNavBar from './pages/navbar/ShowNavBar';
import PrivateRoutes from './components/PrivateRoutes'
import AdminRoute from './components/AdminRoute';
import Order from './pages/Order';
import SendPhotos from './pages/SendPhotos';
import Stats from './pages/Stats';
import { useState, useEffect } from 'react';
import OfflineOrderPage from './offline/OfflineOrderPage';
import useConnectivity from './hooks/useConnectivity'


function App() {

  const { token, setToken } = useToken();
  //const { isConnected } = useConnectivity('/api/ping');
  const isConnected = true;
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected) {
      navigate('/offline', { replace: true }); // replace: true prevents adding to history
    }
  }, [isConnected, navigate]);

  return (
    
    <Routes>
      <Route path="/offline" element={<OfflineOrderPage />} />
      {!isConnected ? (
        <Route path="*" element={<OfflineOrderPage />} />
      ) : (
        <>
          <Route path="/auth" element={<Auth setToken={setToken} />} />
          <Route path="/printorder/:id" element={<Order />} />
          <Route path="/" element={<PrivateRoutes />}>
            <Route path="/" element={<Navbar />}>
              <Route index element={<AdminRoute />} />
              <Route path="order" element={<Home />} />
              <Route path="stats" element={<Stats />} />
              <Route path="photos" element={<Photos />} />
              <Route path="send-photos" element={<SendPhotos />} />
              <Route path="reppersonal" element={<RepPersonal />} />
              <Route path="clientlist" element={<ClientList />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Route>
        </>
      )}
    </Routes>
  );
}

export default App;
