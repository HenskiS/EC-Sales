import Navbar from './pages/navbar/Navbar';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Photos from './pages/Photos';
import RepPersonal from './pages/RepPersonal';
import ClientList from './pages/ClientList';
import Auth from './pages/Auth';
import useToken from './hooks/useToken';
import ShowNavBar from './pages/navbar/ShowNavBar';
import PrivateRoutes from './components/PrivateRoutes'
import AdminRoute from './components/AdminRoute';

function App() {

  const { token, setToken } = useToken();


  return (
    
        <Routes>
          <Route path="/" element={<PrivateRoutes />}>
            <Route path="/" element={<Navbar />}>
              <Route index element={<AdminRoute />} />
              <Route path="order" element={<Home />} />
              <Route path="photos" element={<Photos />} />
              <Route path="reppersonal" element={<RepPersonal />} />
              <Route path="clientlist" element={<ClientList />} />
              {/*<Route path="auth" element={<Auth setToken={setToken} />} />*/}
              <Route path="*" element={<Home />} />
            </Route>
          </Route>
          <Route path="/auth" element={<Auth setToken={setToken} />} />
        </Routes>
  );
}

export default App;
