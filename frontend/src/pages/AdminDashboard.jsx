import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { adminService, categoryService } from '../services';
import { AuthContext } from '../store/authStore';

const AdminDashboard = () => {
  const { lang } = useTranslation();
  const { user, isAuthenticated, login } = useContext(AuthContext);

  // Admin Direct Login State
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard Data State
  const [analytics, setAnalytics] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [anRes, bizRes, usrRes, catRes] = await Promise.allSettled([
        adminService.getAnalytics(),
        adminService.getBusinesses(),
        adminService.getUsers({ limit: 50 }),
        categoryService.getCategories()
      ]);

      if (anRes.status === 'fulfilled') setAnalytics(anRes.value.data?.data);
      if (bizRes.status === 'fulfilled') setBusinesses(bizRes.value.data?.data || []);
      if (usrRes.status === 'fulfilled') setUsers(usrRes.value.data?.data || []);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAdminData();
    }
  }, [isAuthenticated, user]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      await login(adminUser, adminPass);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid admin credentials');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await adminService.verifyBusiness(id, status);
      setMsg(`Business marked as ${status}!`);
      setTimeout(() => setMsg(''), 3000);
      loadAdminData();
    } catch (err) {
      alert('Verification action failed');
    }
  };

  const handleChangeRole = async (userId, role) => {
    try {
      await adminService.updateUserRole(userId, role);
      setMsg(`User role updated to ${role}!`);
      setTimeout(() => setMsg(''), 3000);
      loadAdminData();
    } catch (err) {
      alert('Role change failed');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await categoryService.createCategory({ name: newCatName.trim(), description: 'Rural marketplace category' });
      setNewCatName('');
      loadAdminData();
    } catch (err) {
      alert('Failed to add category');
    }
  };

  // If NOT logged in as Admin, show direct Admin Login Interface
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div style={{ maxWidth: '440px', margin: '60px auto' }}>
        <div className="card" style={{ padding: '36px', textAlign: 'center', borderTop: '5px solid #d32f2f' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>⚡</div>
          <h2 style={{ color: '#d32f2f', margin: '0 0 6px' }}>Direct Admin Gateway</h2>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
            Enter administrator credentials to access the RuralConnect Command Centre.
          </p>

          {loginError && (
            <div style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Username:</label>
              <input
                type="text"
                required
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password:</label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{
                background: '#d32f2f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                marginTop: '6px',
                fontSize: '1rem'
              }}
            >
              {loginLoading ? 'Authenticating Admin...' : 'Access Admin Dashboard ➔'}
            </button>
          </form>

          <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#888' }}>
            Default credentials: <code>admin</code> / <code>admin123</code>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Admin Panel...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#d32f2f', margin: 0 }}>
            ⚡ {lang === 'hi' ? 'ग्रामीण कनेक्ट - मुख्य प्रशासनिक नियंत्रण कक्ष' : 'RuralConnect - Super Admin Control'}
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            Logged in as Super Admin (admin@ruralconnect.in)
          </p>
        </div>
      </div>

      {msg && (
        <div style={{ background: '#e8f5e9', color: '#2E7D32', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontWeight: 600 }}>
          ✓ {msg}
        </div>
      )}

      {/* Analytics Counter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: lang === 'hi' ? 'कुल उपयोगकर्ता' : 'Total Users', count: analytics?.totalUsers || 0, icon: '👥', color: '#1565c0' },
          { label: lang === 'hi' ? 'पंजीकृत दुकानें' : 'Businesses', count: analytics?.totalBusinesses || 0, icon: '🏪', color: '#2E7D32' },
          { label: lang === 'hi' ? 'सक्रिय उत्पाद' : 'Active Products', count: analytics?.totalProducts || 0, icon: '🌾', color: '#FF6F00' },
          { label: lang === 'hi' ? 'खुली नौकरियां' : 'Open Jobs', count: analytics?.totalJobs || 0, icon: '💼', color: '#6a1b9a' },
          { label: lang === 'hi' ? 'कुल ऑर्डर' : 'Total Orders', count: analytics?.totalOrders || 0, icon: '🛍️', color: '#00838f' }
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '20px', borderLeft: `5px solid ${stat.color}` }}>
            <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Section 1: Business Verifications */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#2E7D32' }}>
          🏪 {lang === 'hi' ? 'दुकानदार सत्यापन (Business Verifications)' : 'Business Approvals'}
        </h3>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px' }}>Business Name</th>
                <th style={{ padding: '10px' }}>Owner</th>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Location</th>
                <th style={{ padding: '10px' }}>Delivery Radius</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map(b => (
                <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{b.businessName}</td>
                  <td style={{ padding: '10px' }}>{b.owner?.name} ({b.owner?.email})</td>
                  <td style={{ padding: '10px' }}>{b.category}</td>
                  <td style={{ padding: '10px' }}>{b.address?.city}, {b.address?.state}</td>
                  <td style={{ padding: '10px' }}>{b.deliveryRadiusKm || 10} km</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge" style={{ background: b.verificationStatus === 'APPROVED' ? '#e8f5e9' : '#fff3e0', color: b.verificationStatus === 'APPROVED' ? '#2E7D32' : '#e65100' }}>
                      {b.verificationStatus}
                    </span>
                  </td>
                  <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                    {b.verificationStatus !== 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleVerify(b._id, 'APPROVED')}
                        style={{ background: '#2E7D32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '6px' }}
                      >
                        Approve ✓
                      </button>
                    )}
                    {b.verificationStatus !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => handleVerify(b._id, 'REJECTED')}
                        style={{ background: '#c62828', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Reject ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: User Role Management */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#1565c0' }}>
          👥 {lang === 'hi' ? 'उपयोगकर्ता भूमिका प्रबंधन (User RBAC Management)' : 'User Management & Roles'}
        </h3>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Current Role</th>
                <th style={{ padding: '10px' }}>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '10px' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="user">User</option>
                      <option value="retailer">Retailer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Categories */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#FF6F00' }}>
          🌾 {lang === 'hi' ? 'श्रेणी प्रबंधन (Product Categories)' : 'Manage Product Categories'}
        </h3>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px', marginBottom: '16px', maxWidth: '450px', flexWrap: 'wrap' }}>
          <input
            type="text"
            required
            placeholder="e.g. Dairy, Spices, Seeds..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
            Add Category
          </button>
        </form>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(c => (
            <span key={c._id} style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: '16px', fontSize: '0.88rem' }}>
              🌾 {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
