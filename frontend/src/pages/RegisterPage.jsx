import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { AuthContext } from '../store/authStore';
import { authService } from '../services';

const RegisterPage = () => {
  const { t, lang } = useTranslation();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Role toggle: 'user' or 'retailer'
  const [accountType, setAccountType] = useState('user');

  // Customer Form
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '' });

  // Shopkeeper Form
  const [retailerForm, setRetailerForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    category: 'Grocery & General Store',
    phone: '',
    street: '',
    city: 'Rampur',
    state: 'Uttar Pradesh',
    pincode: '244901',
    deliveryRadiusKm: 10,
    lng: 79.02,
    lat: 28.80
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (accountType === 'retailer') {
        // Register Shopkeeper
        await authService.registerRetailer({
          name: retailerForm.name,
          email: retailerForm.email,
          password: retailerForm.password,
          businessName: retailerForm.businessName,
          category: retailerForm.category,
          phone: retailerForm.phone,
          street: retailerForm.street,
          city: retailerForm.city,
          state: retailerForm.state,
          pincode: retailerForm.pincode,
          lng: Number(retailerForm.lng) || 79.02,
          lat: Number(retailerForm.lat) || 28.80,
          deliveryRadiusKm: Number(retailerForm.deliveryRadiusKm) || 10
        });

        // Automatically log in
        await login(retailerForm.email, retailerForm.password);
        navigate('/retailer');
      } else {
        // Register Regular User
        await authService.register({
          name: userForm.name,
          email: userForm.email,
          password: userForm.password
        });

        // Automatically log in
        await login(userForm.email, userForm.password);
        navigate('/');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (lang === 'hi'
            ? 'पंजीकरण में त्रुटि। कृपया सभी विवरण पुनः जांचें।'
            : 'Registration failed. Please check your details.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ maxWidth: accountType === 'retailer' ? '650px' : '440px', transition: 'max-width 0.3s' }}>
      <h2>{t('auth.registerTitle')}</h2>

      {/* Account Type Selector Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div
          onClick={() => setAccountType('user')}
          style={{
            border: accountType === 'user' ? '2px solid #2E7D32' : '1px solid #ddd',
            background: accountType === 'user' ? '#e8f5e9' : '#fff',
            borderRadius: '8px',
            padding: '14px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>👤</div>
          <strong style={{ color: accountType === 'user' ? '#2E7D32' : '#333', fontSize: '0.95rem' }}>
            {lang === 'hi' ? 'सामान्य उपयोगकर्ता / ग्राहक' : 'User / Job Seeker'}
          </strong>
          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '4px' }}>
            {lang === 'hi' ? 'सामान खरीदें, नौकरी खोजें' : 'Buy products & apply for jobs'}
          </div>
        </div>

        <div
          onClick={() => setAccountType('retailer')}
          style={{
            border: accountType === 'retailer' ? '2px solid #FF6F00' : '1px solid #ddd',
            background: accountType === 'retailer' ? '#fff3e0' : '#fff',
            borderRadius: '8px',
            padding: '14px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🏪</div>
          <strong style={{ color: accountType === 'retailer' ? '#FF6F00' : '#333', fontSize: '0.95rem' }}>
            {lang === 'hi' ? 'दुकानदार / व्यापारी' : 'Shopkeeper / Retailer'}
          </strong>
          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '4px' }}>
            {lang === 'hi' ? 'दुकान जोड़ें, सामान व नौकरियां बेचें' : 'List shop, products & post jobs'}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {accountType === 'user' ? (
          /* REGULAR USER FORM */
          <>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                {t('auth.name')}
              </label>
              <input
                type="text"
                placeholder="Ramesh Kumar"
                required
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                placeholder="ramesh@ruralconnect.in"
                required
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                {t('auth.password')} (min 8 chars, 1 letter & 1 number)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
            </div>
          </>
        ) : (
          /* SHOPKEEPER FORM */
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  {lang === 'hi' ? 'दुकानदार का नाम (Owner Name):' : 'Owner Full Name:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Suresh Patel"
                  value={retailerForm.name}
                  onChange={(e) => setRetailerForm({ ...retailerForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  {lang === 'hi' ? 'ईमेल (Login Email):' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  required
                  placeholder="suresh@agrostore.in"
                  value={retailerForm.email}
                  onChange={(e) => setRetailerForm({ ...retailerForm, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  {lang === 'hi' ? 'पासवर्ड (Password):' : 'Password:'}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={retailerForm.password}
                  onChange={(e) => setRetailerForm({ ...retailerForm, password: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  {lang === 'hi' ? 'फ़ोन नंबर (Phone):' : 'Contact Phone:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="9876543210"
                  value={retailerForm.phone}
                  onChange={(e) => setRetailerForm({ ...retailerForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  🏪 {lang === 'hi' ? 'दुकान / व्यापार का नाम (Business Name):' : 'Business / Shop Name:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Kisan Agro & Grocery"
                  value={retailerForm.businessName}
                  onChange={(e) => setRetailerForm({ ...retailerForm, businessName: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  🏷️ {lang === 'hi' ? 'व्यापार श्रेणी (Category):' : 'Shop Category:'}
                </label>
                <select
                  value={retailerForm.category}
                  onChange={(e) => setRetailerForm({ ...retailerForm, category: e.target.value })}
                >
                  <option value="Grocery & General Store">Grocery & General Store (किराना)</option>
                  <option value="Agriculture & Fertilizer">Agriculture & Fertilizer (खाद-बीज केंद्र)</option>
                  <option value="Grains & Wholesale Mandi">Grains & Wholesale Mandi (अनाज मंडी)</option>
                  <option value="Dairy & Farm Supplies">Dairy & Farm Supplies (डेयरी व पशु आहार)</option>
                  <option value="Hardware & Construction">Hardware & Construction (हार्डवेयर)</option>
                </select>
              </div>
            </div>

            {/* Delivery Radius Setting */}
            <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2E7D32' }}>
                  🚚 {lang === 'hi' ? 'डिलीवरी दायरा (Delivery Radius):' : 'Delivery Radius:'}
                </label>
                <strong style={{ fontSize: '1.05rem', color: '#FF6F00' }}>
                  {retailerForm.deliveryRadiusKm} km
                </strong>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={retailerForm.deliveryRadiusKm}
                onChange={(e) => setRetailerForm({ ...retailerForm, deliveryRadiusKm: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#FF6F00' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                {lang === 'hi'
                  ? `आपकी दुकान से ${retailerForm.deliveryRadiusKm} किमी तक के ग्राहकों को डिलीवरी उपलब्ध होगी।`
                  : `Customers within ${retailerForm.deliveryRadiusKm} km of your shop will see delivery available.`}
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  {lang === 'hi' ? 'सड़क / बाज़ार का पता:' : 'Street / Market:'}
                </label>
                <input
                  type="text"
                  placeholder="Main Bazaar, Near Mandi"
                  value={retailerForm.street}
                  onChange={(e) => setRetailerForm({ ...retailerForm, street: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                    {lang === 'hi' ? 'शहर / कस्बा:' : 'City / Town:'}
                  </label>
                  <input
                    type="text"
                    placeholder="Rampur"
                    value={retailerForm.city}
                    onChange={(e) => setRetailerForm({ ...retailerForm, city: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                    {lang === 'hi' ? 'पिनकोड:' : 'Pincode:'}
                  </label>
                  <input
                    type="text"
                    placeholder="244901"
                    value={retailerForm.pincode}
                    onChange={(e) => setRetailerForm({ ...retailerForm, pincode: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: '10px', padding: '12px', fontSize: '1.05rem' }}
        >
          {loading
            ? (lang === 'hi' ? 'खाता बनाया जा रहा है...' : 'Creating account...')
            : accountType === 'retailer'
            ? (lang === 'hi' ? 'दुकानदार खाता पंजीकृत करें (Register Shopkeeper)' : 'Register Shopkeeper Account')
            : t('auth.submitRegister')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
        <span>{t('auth.haveAccount')} </span>
        <Link to="/login" style={{ color: '#2E7D32', fontWeight: 600 }}>{t('nav.login')}</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
