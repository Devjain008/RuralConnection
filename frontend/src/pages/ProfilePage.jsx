import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { profileService } from '../services';
import { AuthContext } from '../store/authStore';

const ProfilePage = () => {
  const { lang } = useTranslation();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    bio: '',
    skills: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
    availabilityStatus: 'AVAILABLE',
    languages: 'Hindi, English'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    profileService.getMyProfile()
      .then(res => {
        const p = res.data.data;
        if (p) {
          setForm({
            bio: p.bio || '',
            skills: Array.isArray(p.skills) ? p.skills.join(', ') : '',
            phone: p.phone || '',
            city: p.location?.city || '',
            state: p.location?.state || '',
            pincode: p.location?.pincode || '',
            availabilityStatus: p.availabilityStatus || 'AVAILABLE',
            languages: Array.isArray(p.languages) ? p.languages.join(', ') : 'Hindi, English'
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await profileService.updateMyProfile({
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        phone: form.phone,
        location: { city: form.city, state: form.state, pincode: form.pincode },
        availabilityStatus: form.availabilityStatus,
        languages: form.languages.split(',').map(s => s.trim()).filter(Boolean)
      });
      setMsg(lang === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई!' : 'Profile updated successfully!');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ color: '#2E7D32', marginBottom: '20px' }}>
        👤 {lang === 'hi' ? 'मेरी व्यावसायिक प्रोफ़ाइल' : 'My Professional Profile'}
      </h1>

      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#2E7D32', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 'bold' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{user?.name}</h2>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>{user?.email} • Role: {user?.role}</div>
          </div>
        </div>

        {msg && <div style={{ background: '#e8f5e9', color: '#2E7D32', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontWeight: 600 }}>✓ {msg}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>
              {lang === 'hi' ? 'कार्य उपलब्धता (Availability):' : 'Availability Status:'}
            </label>
            <select
              value={form.availabilityStatus}
              onChange={(e) => setForm({ ...form, availabilityStatus: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="AVAILABLE">{lang === 'hi' ? 'उपलब्ध (Available)' : 'Available'}</option>
              <option value="WORKING">{lang === 'hi' ? 'कार्यरत (Currently Working)' : 'Working'}</option>
              <option value="OPEN_TO_OPPORTUNITIES">{lang === 'hi' ? 'नए अवसरों के लिए तैयार' : 'Open to Opportunities'}</option>
              <option value="NOT_AVAILABLE">{lang === 'hi' ? 'अनुपलब्ध (Not Available)' : 'Not Available'}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>
              {lang === 'hi' ? 'कौशल (Skills - कॉमा से अलग करें):' : 'Skills (comma separated):'}
            </label>
            <input
              type="text"
              placeholder="Agriculture, Tractor Driving, Carpentry, Retail"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px', fontWeight: 600 }}>
              {lang === 'hi' ? 'संक्षिप्त परिचय / बायो (Bio):' : 'About Me / Bio:'}
            </label>
            <textarea
              rows={3}
              placeholder={lang === 'hi' ? 'अपने काम और अनुभव के बारे में बताएं...' : 'Tell employers about your trade experience...'}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                {lang === 'hi' ? 'फ़ोन नंबर:' : 'Phone Number:'}
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                {lang === 'hi' ? 'शहर / गाँव:' : 'City / Village:'}
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                {lang === 'hi' ? 'राज्य:' : 'State:'}
              </label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '12px', marginTop: '10px' }}>
            {saving ? 'Saving...' : (lang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
