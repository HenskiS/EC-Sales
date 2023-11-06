/*import { Link } from 'react-router-dom';
import * as AiIcons from "react-icons/ai";
import { useState } from 'react';
import { SidebarData } from './SidebarData';
import './Navbar.css';
import { IconContext } from 'react-icons';*/

import { useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link, Outlet } from 'react-router-dom';
//import { SidebarData } from './SidebarData';
import { IconContext } from 'react-icons';

import * as IoIcons from "react-icons/io";

function Navbar() {
    const [sidebar, setSidebar] = useState(false);
  
    const showSidebar = () => setSidebar(!sidebar);

    const handleLogout = () => {
      sessionStorage.clear();
      window.location.reload();
    }

    useEffect(() => {
      //console.log("render bar")
      let currentDate = new Date();
      if (JSON.parse(sessionStorage.getItem("accessToken")).exp * 1000 < new Date(currentDate).getTime()) {
        alert("Your session has expired. Please login again.");
        handleLogout();
      }
    }, [sidebar])
  
    return (
      <>
        <IconContext.Provider value={{ color: '#fff' }}>
          <div className='navbar'>
            <Link to='#' className='menu-bars'>
              <FaIcons.FaBars onClick={showSidebar} />
            </Link>
            <button className='logout' onClick={handleLogout}>
              Logout
            </button>
          </div>
          <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
            <ul className='nav-menu-items' onClick={showSidebar}>
              <li className='navbar-toggle'>
                <Link to='#' className='menu-bars'>
                  <AiIcons.AiOutlineClose />
                </Link>
              </li>
              {(!JSON.parse(sessionStorage.getItem('UserInfo')).roles.includes("Admin")) ? <></> :
              <li key={0} className='nav-text'>
                <Link to='/'>
                  <AiIcons.AiOutlineDashboard />
                  <span>Dashboard</span>
                </Link>
              </li>}
              <li key={1} className='nav-text'>
                <Link to='/order'>
                  <IoIcons.IoMdPaper />
                  <span>Order Form</span>
                </Link>
              </li>
              <li key={2} className='nav-text'>
                <Link to='/photos'>
                  <AiIcons.AiOutlinePicture />
                  <span>Photos</span>
                </Link>
              </li>
              <li key={3} className='nav-text'>
                <Link to='/clientlist'>
                  <IoIcons.IoMdPeople />
                  <span>Client List</span>
                </Link>
              </li>
            </ul>
          </nav>
        </IconContext.Provider>
        <Outlet />
      </>
    );
  }
  
export default Navbar;