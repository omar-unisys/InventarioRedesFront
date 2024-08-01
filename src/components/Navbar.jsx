import React, { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { SidebarData } from '../helpers/SidebarData';
import './Navbar.css';
import { IconContext } from 'react-icons';
import { RiLogoutBoxLine } from "react-icons/ri";
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2'

export const Navbar = () => {
    const [sidebar, setSidebar] = useState(false);
    const { logout, user } = useAuth();

    const showSidebar = () => setSidebar(!sidebar);

    const handleLogout = () => {

        Swal.fire({
        title: "Está seguro que desea cerrar sesión?",
        text: "",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        cancelButtonText: "No",
        confirmButtonText: "Si"
        }).then((result) => {
        if (result.isConfirmed) {
            logout();
        }
        });
    };

    const renderSubMenu = (subNav) => {
        return (
        <ul>
            {subNav.map((subItem, index) => (
            <li key={index}>
                <Link to={subItem.path} onClick={showSidebar}>
                <div className="svg-container">
                    {subItem.icon}
                </div>
                <span>{subItem.title}</span>
                </Link>
            </li>
            ))}
        </ul>
        );
    };
  return (
    <div id='menu'>
      <IconContext.Provider value={{ color: '#fff' }}>
        <div className='navbar'>
          <Link to='#' className='menu-bars'>
            <FaIcons.FaBars onClick={showSidebar} />
          </Link>
          <div className='header'>
            <span className='titulo'>Facturación grupo ISA</span>
            <span className='user'>{user.nombres + ' ' + user.apellidos}&nbsp;&nbsp;</span>
          </div>
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items'>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars' onClick={showSidebar}>
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            <div className='menu-items'>
              {SidebarData.map((item, index) => {
                return (
                  <li key={index} className={item.cName}>
                    {item.subNav ? 
                      <div className='menu-submenu'>
                        <div className="svg-container">
                          {item.icon}
                        </div>
                        <span>{item.title}</span>
                      </div>
                    :
                      <Link to={item.path} onClick={showSidebar}>
                        <div className="svg-container">
                          {item.icon}
                        </div>
                        <span>{item.title}</span>
                      </Link>
                    }
                    {item.subNav && renderSubMenu(item.subNav)}
                  </li>
                );
              })}

              <li className='nav-text'>
                <Link to='#' onClick={handleLogout}>
                  <RiLogoutBoxLine />
                  <span>Cerrar sesión</span>
                </Link>
              </li>
            </div>
          </ul>
        </nav>
      </IconContext.Provider>
    </div>
  )
}
