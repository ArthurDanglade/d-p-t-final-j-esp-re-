import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaPlus, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './BottomNavigation.css'; // Assurez-vous d'importer le fichier CSS

function handleLogout() {
  // Suppression du token du stockage local
  localStorage.removeItem('token');

  // Redirigez l'utilisateur vers la page de connexion
  window.location.href = '/login'; 
}

const BottomNavigation = () => {
  const [isHidden, setIsHidden] = useState(false);
  let lastScrollTop = 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll > lastScrollTop) {
        // Scroll down
        setIsHidden(true);
      } else {
        // Scroll up
        setIsHidden(false);
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // For Mobile or negative scrolling
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`bottom-navigation ${isHidden ? 'hidden' : ''}`}>
      <ul>
        <li>
          <Link to="/HomePage">
            <FaHome />
          </Link>
        </li>
        <li className="separator">
          <Link to="/SearchPage">
            <FaSearch />
          </Link>
        </li>
        <li className="separator">
          <Link to="/CreateBD">
            <FaPlus />
          </Link>
        </li>
        <li className="separator">
          <Link to="/ProfilPage">
            <FaUser />
          </Link>
        </li>
        <li>
          <button onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default BottomNavigation;