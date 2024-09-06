/*import { Link } from 'react-router-dom';
import * as AiIcons from "react-icons/ai";
import { useState } from 'react';
import { SidebarData } from './SidebarData';
import './Navbar.css';
import { IconContext } from 'react-icons';*/

import { useContext, useEffect, useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link, Outlet } from 'react-router-dom';
//import { SidebarData } from './SidebarData';
import { IconContext } from 'react-icons';

import * as IoIcons from "react-icons/io";
import OrderContext from '../../context/OrderContext';

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

    const uinfo = sessionStorage.getItem('UserInfo')
    const UserInfo = uinfo ? JSON.parse(uinfo) : {name: "", userID: ""}
    const { submitStoredOrder } = useContext(OrderContext)

    const ordersString = localStorage.getItem("orders")
    if (ordersString) {
        const orders = JSON.parse(ordersString)
        const names = orders.map(o => o.client.company)
        orders.forEach((order, index) => {
            if (!order.client.company.length)
              order.client.company = index
            if (names.find(n=>n===order.client.company)) {
              order.client.company = order.client.company + index
            }
            submitStoredOrder(
                order.client, 
                order.cigars,
                order.cigarData, 
                order.notes, 
                {_id: UserInfo.userID, name: UserInfo.name, email: UserInfo.email}
            )
        })
        localStorage.removeItem("orders")
    }
  
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