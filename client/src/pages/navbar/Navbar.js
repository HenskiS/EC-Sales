/*import { Link } from 'react-router-dom';
import * as AiIcons from "react-icons/ai";
import { useState } from 'react';
import { SidebarData } from './SidebarData';
import './Navbar.css';
import { IconContext } from 'react-icons';*/

import { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link, Outlet } from 'react-router-dom';
//import { SidebarData } from './SidebarData';
import { IconContext } from 'react-icons';

import * as IoIcons from "react-icons/io";

function Navbar() {
    const [sidebar, setSidebar] = useState(false);
  
    const showSidebar = () => setSidebar(!sidebar);
  
    return (
      <>
        <IconContext.Provider value={{ color: '#fff' }}>
          <div className='navbar'>
            <Link to='#' className='menu-bars'>
              <FaIcons.FaBars onClick={showSidebar} />
            </Link>
            <button className='logout' onClick={() => {
              sessionStorage.clear();
              window.location.reload();
            }}>
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

              <li key={0} className='nav-text'>
                <Link to='/'>
                  <IoIcons.IoMdPaper />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li key={1} className='nav-text'>
                <Link to='/photos'>
                  <AiIcons.AiOutlinePicture />
                  <span>Photos</span>
                </Link>
              </li>
              {/*<li key={2} className='nav-text'>
                <Link to='/reppersonal'>
                  <AiIcons.AiOutlineFileText />
                  <span>Rep Personal</span>
                </Link>
          </li>*/}
              <li key={3} className='nav-text'>
                <Link to='/clientlist'>
                  <IoIcons.IoMdPeople />
                  <span>Client List</span>
                </Link>
              </li>
              {/*<li key={4} className='nav-text'>
                {<Link to='/auth'>
                  <IoIcons.IoIosLock />
                  <span>Logout</span>
                </Link>}
                <a onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}>
                  <IoIcons.IoIosLock />
                  <span>Logout</span>
                </a>
              </li>*/}

              
              {/*{SidebarData.map((item, index) => {
                return (
                  <li key={index} className={item.cName}>
                    <Link to={item.path}>
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}*/}
            </ul>
          </nav>
        </IconContext.Provider>
        <Outlet />
      </>
    );
  }
  
  export default Navbar;

/*
const Navbar = () => {

    const [sidebar, setSidebar] = useState(false);

    const showSidebar = () => setSidebar(!sidebar);

    return ( 
        <div>
        <IconContext.Provider value={{ color: '#fff' }}>
            <div className="navbar">
                <Link to="#" className='menu-bars'>
                    <AiIcons.AiOutlineMenu onClick={showSidebar} />
                </Link>
            </div>
            <nav className={sidebar ? 'nav-menu-active' : 'nav-menu'}>
                <ul className="nav-menu-items" onClick={showSidebar}>
                    <li className="navbar-toggle">
                        <Link to='#' className='menu-bars'>
                            <AiIcons.AiOutlineClose onClick={showSidebar} />
                        </Link>
                    </li>
                    { SidebarData.map((item, index) => {
                        return (
                            <li key={index} className={item.cName}>
                                <Link to={item.path}>
                                    {item.icon}
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>
        </IconContext.Provider>
        </div>
        
        
        
    );
}

export default Navbar;
*/


/*<nav className="navbar">
            <h1>EC Sales App</h1>
            <div className="links">
                <i></i>
                <Link to="/">Dashboard</Link>
                <Link to="/photos">Photos
                    <AiIcons.AiOutlineMenu />
                </Link>
                <Link to="/reppersonal">Rep Personal</Link>
                <Link to="/clientlist">Client List</Link>
            </div>
    </nav>*/