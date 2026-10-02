import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { AuthContext } from '../store/authStore';

const LoginPage = () => {
  const { t, lang } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(identifier, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'retailer') {
        navigate('/retailer');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (lang === 'hi'
            ? 'लॉग इन विफल रहा। ईमेल/यूज़रनेम या पासवर्ड जांचें।'
            : 'Login failed. Check your email/username and password.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminQuickFill = () => {
    setIdentifier('admin');
    setPassword('admin123');
  };

  return (
    <div className="auth-page">
      <h2>{t('auth.loginTitle')}</h2>

      {/* Admin Demo Quick Login Callout */}
      <div
        onClick={handleAdminQuickFill}
        style={{
          background: '#ffebee',
          border: '1px dashed #d32f2f',
          color: '#c62828',
          padding: '10px 14px',
          borderRadius: '8px',
          marginBottom: '16px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>⚡ <strong>Admin Login:</strong> admin / admin123</span>
        <span style={{ fontSize: '0.78rem', textDecoration: 'underline' }}>Auto-Fill</span>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
            {lang === 'hi' ? 'ईमेल या यूज़रनेम (Email / Username):' : 'Email or Username:'}
          </label>
          <input
            type="text"
            placeholder="admin or user@ruralconnect.in"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
            {t('auth.password')}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
          {loading ? (lang === 'hi' ? 'लॉग इन हो रहा है...' : 'Logging in...') : t('auth.submitLogin')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
        <span>{t('auth.noAccount')} </span>
        <Link to="/register" style={{ color: '#2E7D32', fontWeight: 600 }}>{t('nav.register')}</Link>
      </div>
    </div>
  );
};

export default LoginPage;
