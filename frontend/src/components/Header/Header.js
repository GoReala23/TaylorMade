import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoginModal from '../Modals/LoginModal/LoginModal';
import './Header.css';
import logo from '../../images/logo.webp';

const Header = ({ cartItems, fetchCart }) => {
  const { isLoggedIn, logout, user, login } = useContext(AuthContext);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isLandingPage = useLocation().pathname === '/';

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowLoginModal(true);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <header
      className={`header ${isLandingPage ? 'header--landing' : ''} ${isLoggedIn ? 'header--dashboard' : 'header--no-dashboard'}`}
    >
      <Link to='/' className='header__logo'>
        <img className='header__logo-image' src={logo} alt='Taylor-Made' />
      </Link>

      <button className='header__menu-toggle' onClick={toggleNav}>
        ☰
      </button>

      <nav className={`header__nav ${isNavOpen ? 'header__nav--open' : ''}`}>
        <Link to='/home' className='header__nav-link' onClick={toggleNav}>
          Home
        </Link>
        <Link to='/products' className='header__nav-link' onClick={toggleNav}>
          Products
        </Link>
        <Link to='/about' className='header__nav-link' onClick={toggleNav}>
          About
        </Link>
        <Link to='/locations' className='header__nav-link' onClick={toggleNav}>
          Locations
        </Link>

        {isLoggedIn ? (
          <div className='header__user'>
            {user && (
              <span className='header__user-name'>Welcome, {user.name}</span>
            )}
            <button
              onClick={handleLogout}
              className='header__nav-link header__nav-link--logout'
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to='/login'
            className='header__nav-link'
            onClick={handleLoginClick}
          >
            Login
          </Link>
        )}
      </nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={login}
        onSwitchToRegister={() => setShowLoginModal(!showLoginModal)}
      />
    </header>
  );
};

export default Header;
