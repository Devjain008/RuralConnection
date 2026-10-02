import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { AuthContext } from '../store/authStore';
import { CartContext } from '../store/cartStore';
import { LocationContext } from '../store/locationStore';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t, lang } = useTranslation();
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const { userLocation, detectLocation, detecting } = useContext(LocationContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo & Desktop Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div className="logo" style={{ minWidth: 0, flexShrink: 0 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.4rem' }}>🌾</span>
              <span className="brand-title">RuralConnect</span>
            </Link>
          </div>

          {/* Desktop Location Pill */}
          <button
            type="button"
            className="nav-links-desktop location-pill"
            onClick={detectLocation}
            title="Click to detect current GPS location"
            style={{
              background: 'rgba(255,255,255,0.18)',
              border: 'none',
              color: '#fff',
              borderRadius: '20px',
              padding: '5px 12px',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            <span>📍</span>
            <span>{detecting ? (lang === 'hi' ? 'स्थान खोज रहे हैं...' : 'Detecting GPS...') : userLocation?.name || 'Local Area'}</span>
            <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>⚡</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="nav-links-desktop">
          <Link to="/" style={{ fontWeight: 600 }}>{t('nav.home')}</Link>
          <Link to="/products" style={{ fontWeight: 600 }}>{t('nav.products')}</Link>
          <Link to="/jobs" style={{ fontWeight: 600 }}>{t('nav.jobs')}</Link>
          <Link to="/businesses" style={{ fontWeight: 600 }}>{t('nav.businesses')}</Link>

          {/* Cart with badge */}
          <Link to="/cart" style={{ position: 'relative', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>🛒</span>
            <span>{t('nav.cart')}</span>
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {/* User Profile Dropdown Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: 'rgba(255,255,255,0.22)',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: '#fff',
                  borderRadius: '24px',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                <span>👤 {user?.name}</span>
                <span style={{ fontSize: '0.7rem' }}>▼</span>
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    background: '#fff',
                    color: '#333',
                    borderRadius: '10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                    minWidth: '220px',
                    zIndex: 300,
                    overflow: 'hidden',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ padding: '12px 16px', background: '#f5f5f5', borderBottom: '1px solid #eee' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{user?.email}</div>
                    <span
                      className="badge"
                      style={{
                        marginTop: '6px',
                        background: user?.role === 'admin' ? '#ffebee' : user?.role === 'retailer' ? '#fff3e0' : '#e8f5e9',
                        color: user?.role === 'admin' ? '#c62828' : user?.role === 'retailer' ? '#e65100' : '#2e7d32'
                      }}
                    >
                      Role: {user?.role?.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{ padding: '10px 16px', color: '#333', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>👤</span> <span>{t('nav.profile')}</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      style={{ padding: '10px 16px', color: '#333', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>🛍️</span> <span>{t('nav.orders')}</span>
                    </Link>

                    {user?.role === 'user' && (
                      <Link
                        to="/applications"
                        onClick={() => setDropdownOpen(false)}
                        style={{ padding: '10px 16px', color: '#333', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <span>📋</span> <span>{t('nav.applications')}</span>
                      </Link>
                    )}

                    {user?.role === 'retailer' && (
                      <Link
                        to="/retailer"
                        onClick={() => setDropdownOpen(false)}
                        style={{ padding: '10px 16px', color: '#e65100', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <span>🏪</span> <span>{lang === 'hi' ? 'दुकानदार पोर्टल' : 'Retailer Hub'}</span>
                      </Link>
                    )}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        style={{ padding: '10px 16px', color: '#c62828', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <span>⚡</span> <span>{lang === 'hi' ? 'एडमिन पैनल' : 'Admin Panel'}</span>
                      </Link>
                    )}

                    <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid #eee' }} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#c62828',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600
                      }}
                    >
                      <span>🚪</span> <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Link to="/login" style={{ fontWeight: 600 }}>{t('nav.login')}</Link>
              <Link
                to="/register"
                style={{
                  background: '#FF6F00',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          <LanguageSwitcher />
        </div>

        {/* Mobile Action Controls (Visible ONLY on Mobile/Tablet screens) */}
        <div className="mobile-controls">
          {/* Mobile Cart Quick Icon */}
          <Link
            to="/cart"
            style={{ position: 'relative', fontSize: '1.25rem', textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', padding: '6px 8px' }}
            aria-label="View shopping cart"
          >
            🛒
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {/* Top Bar inside Drawer: GPS Locator & Language Switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={detectLocation}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                cursor: 'pointer',
                fontWeight: 600,
                minWidth: 0
              }}
            >
              <span>📍</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {detecting ? (lang === 'hi' ? 'स्थान खोज रहे हैं...' : 'Detecting GPS...') : userLocation?.name || 'Local Area'}
              </span>
            </button>

            {/* Language Switcher in Mobile Drawer */}
            <div style={{ flexShrink: 0 }}>
              <LanguageSwitcher />
            </div>
          </div>

          {/* User Info Header if Authenticated */}
          {isAuthenticated && (
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>👤 {user?.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>{user?.email}</div>
              <span
                className="badge"
                style={{
                  marginTop: '6px',
                  background: user?.role === 'admin' ? '#ffebee' : user?.role === 'retailer' ? '#fff3e0' : '#e8f5e9',
                  color: user?.role === 'admin' ? '#c62828' : user?.role === 'retailer' ? '#e65100' : '#2e7d32'
                }}
              >
                ROLE: {user?.role?.toUpperCase()}
              </span>
            </div>
          )}

          {/* Primary Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '10px 14px', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)' }}
            >
              <span>🏠</span> <span>{t('nav.home')}</span>
            </Link>

            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '10px 14px', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)' }}
            >
              <span>🌾</span> <span>{t('nav.products')}</span>
            </Link>

            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '10px 14px', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)' }}
            >
              <span>💼</span> <span>{t('nav.jobs')}</span>
            </Link>

            <Link
              to="/businesses"
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '10px 14px', borderRadius: '6px', color: '#fff', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)' }}
            >
              <span>🏪</span> <span>{t('nav.businesses')}</span>
            </Link>
          </div>

          {/* User Specific Links */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px' }}>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '6px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span>👤</span> <span>{t('nav.profile')}</span>
              </Link>

              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '10px 14px', borderRadius: '6px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <span>🛍️</span> <span>{t('nav.orders')}</span>
              </Link>

              {user?.role === 'user' && (
                <Link
                  to="/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '10px 14px', borderRadius: '6px', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <span>📋</span> <span>{t('nav.applications')}</span>
                </Link>
              )}

              {user?.role === 'retailer' && (
                <Link
                  to="/retailer"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '10px 14px', borderRadius: '6px', color: '#ffd54f', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)' }}
                >
                  <span>🏪</span> <span>{lang === 'hi' ? 'दुकानदार पोर्टल (Retailer Hub)' : 'Retailer Hub'}</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '10px 14px', borderRadius: '6px', color: '#ff8a80', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)' }}
                >
                  <span>⚡</span> <span>{lang === 'hi' ? 'एडमिन पैनल (Admin Panel)' : 'Admin Panel'}</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  marginTop: '8px',
                  background: 'rgba(198, 40, 40, 0.9)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🚪</span> <span>{t('nav.logout')}</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '12px' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                {t('nav.login')}
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: '#FF6F00',
                  color: '#fff',
                  textAlign: 'center',
                  padding: '10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
