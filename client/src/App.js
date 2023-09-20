import Navbar from './pages/navbar/Navbar';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Photos from './pages/Photos';
import RepPersonal from './pages/RepPersonal';
import ClientList from './pages/ClientList';
import Auth from './pages/Auth';
import useToken from './hooks/useToken';
import ShowNavBar from './pages/navbar/ShowNavBar';

function App() {

  const { token, setToken } = useToken();


  return (
    <BrowserRouter>
      <div className="App">
        <ShowNavBar>
          <Navbar />
        </ShowNavBar>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/reppersonal" element={<RepPersonal />} />
            <Route path="/clientlist" element={<ClientList />} />
            <Route path="/auth" element={<Auth setToken={setToken} />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
