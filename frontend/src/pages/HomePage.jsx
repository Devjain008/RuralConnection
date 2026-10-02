import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { productService, jobService } from '../services';
import { LocationContext } from '../store/locationStore';

const HomePage = () => {
  const { t, lang } = useTranslation();
  const { userLocation, calculateDistance } = useContext(LocationContext);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    // Fetch latest products
    productService.getProducts({ limit: 10 })
      .then(res => setFeaturedProducts(res.data.data || []))
      .catch(() => {});

    // Fetch latest jobs
    jobService.getJobs({ limit: 4 })
      .then(res => setFeaturedJobs(res.data.data || []))
      .catch(() => {});
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim().length >= 2) {
      try {
        const res = await productService.autocomplete(val);
        setSuggestions(res.data.data || []);
      } catch (err) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Only show products within delivery range of user's home on the home dashboard
  const deliverableProducts = featuredProducts.filter(p => {
    const shopCoords = p.business?.location?.coordinates || p.location?.coordinates || [79.02, 28.80];
    const distanceKm = calculateDistance(shopCoords);
    const deliveryRadius = p.business?.deliveryRadiusKm || 10;
    return distanceKm === null || distanceKm <= deliveryRadius;
  });

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>{t('home.heroTitle')}</h1>
        <p style={{ fontSize: '1.15rem', color: '#555', maxWidth: '680px', margin: '0 auto 20px' }}>
          {t('home.heroSubtitle')}
        </p>

        {/* Search Bar with Trie Autocomplete */}
        <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto' }}>
          <form onSubmit={handleSearchSubmit} className="search-container" style={{ margin: 0 }}>
            <input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ fontSize: '1rem', padding: '12px 16px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
              {t('common.search')}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                zIndex: 10,
                marginTop: '4px',
                textAlign: 'left'
              }}
            >
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSearchTerm(item.name || item.word);
                    setSuggestions([]);
                    navigate(`/products?keyword=${encodeURIComponent(item.name || item.word)}`);
                  }}
                  style={{
                    padding: '10px 16px',
                    borderBottom: idx !== suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f9f9f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                >
                  🔍 {item.name || item.word}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Category / Pillar Cards */}
      <section className="pillar-cards-grid">
        <Link to="/products?purchaseType=RETAIL" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🛒</div>
            <h3 style={{ color: '#2E7D32', marginBottom: '6px' }}>{lang === 'hi' ? 'खुदरा बाज़ार' : 'Retail Market'}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{lang === 'hi' ? 'दैनिक आवश्यकता का सामान उचित मूल्य पर' : 'Daily grocery and essential retail goods'}</p>
          </div>
        </Link>

        <Link to="/products?purchaseType=WHOLESALE" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📦</div>
            <h3 style={{ color: '#2E7D32', marginBottom: '6px' }}>{lang === 'hi' ? 'थोक बाज़ार (Wholesale)' : 'Wholesale Hub'}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{lang === 'hi' ? 'किसानों और व्यापारियों के लिए भारी छूट' : 'Bulk grains, seeds & supplies with MOQ pricing'}</p>
          </div>
        </Link>

        <Link to="/jobs" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💼</div>
            <h3 style={{ color: '#2E7D32', marginBottom: '6px' }}>{lang === 'hi' ? 'स्थानीय नौकरियां' : 'Local Jobs'}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{lang === 'hi' ? 'अपने गाँव और कस्बे में रोज़गार खोजें' : 'Verified jobs in agriculture, shops & trade'}</p>
          </div>
        </Link>

        <Link to="/businesses" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="card" style={{ padding: '24px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏪</div>
            <h3 style={{ color: '#2E7D32', marginBottom: '6px' }}>{lang === 'hi' ? 'नजदीकी दुकानदार' : 'Nearby Businesses'}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{lang === 'hi' ? 'सत्यापित स्थानीय व्यापार और सेवाएँ' : 'Connect with verified local businesses'}</p>
          </div>
        </Link>
      </section>

      {/* Featured Products (Filtered to user's deliverable range) */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ color: '#2E7D32', margin: 0 }}>
              🌾 {lang === 'hi' ? 'आपके पते पर डिलीवरी योग्य उत्पाद' : 'Products Deliverable to Your Home'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '2px' }}>
              📍 {lang === 'hi' ? `स्थान: ${userLocation?.name}` : `Near: ${userLocation?.name}`}
            </div>
          </div>
          <Link to="/products" style={{ color: '#FF6F00', fontWeight: 600 }}>{lang === 'hi' ? 'सभी देखें →' : 'View All →'}</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
          {deliverableProducts.slice(0, 4).map(p => {
            const shopCoords = p.business?.location?.coordinates || p.location?.coordinates || [79.02, 28.80];
            const distanceKm = calculateDistance(shopCoords);

            return (
              <div key={p._id} className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '3rem', textAlign: 'center', padding: '16px 0', background: '#f5f5f5', borderRadius: '6px', marginBottom: '12px' }}>
                  🌾
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{p.name}</h4>
                <div style={{ fontSize: '0.82rem', color: '#2E7D32', fontWeight: 600, marginBottom: '6px' }}>
                  🚚 {lang === 'hi' ? `डिलीवरी उपलब्ध (~${distanceKm || 0} किमी)` : `Delivery Available (~${distanceKm || 0} km)`}
                </div>
                <p style={{ color: '#666', fontSize: '0.85rem', flex: 1, margin: '0 0 10px' }}>{p.description?.slice(0, 70)}...</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontWeight: 'bold', color: '#2E7D32', fontSize: '1.1rem' }}>₹{p.price}</span>
                  <span className="badge" style={{ background: p.purchaseType === 'WHOLESALE' ? '#e8f5e9' : '#fff3e0', color: p.purchaseType === 'WHOLESALE' ? '#2E7D32' : '#e65100' }}>
                    {p.purchaseType}
                  </span>
                </div>
                <Link to={`/products/${p._id}`} className="btn btn-primary" style={{ textAlign: 'center', textDecoration: 'none', marginTop: '12px', padding: '8px' }}>
                  {t('common.viewDetails')}
                </Link>
              </div>
            );
          })}
          {deliverableProducts.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: '#777' }}>
              <p>{lang === 'hi' ? 'वर्तमान में आपके स्थान के डिलीवरी दायरे में कोई उत्पाद नहीं है।' : 'No products currently within delivery range of your location.'}</p>
              <Link to="/products" style={{ color: '#2E7D32', fontWeight: 600 }}>
                {lang === 'hi' ? 'दुकान से पिकअप हेतु सभी उत्पाद देखें →' : 'Browse all products for in-store pickup →'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Jobs */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: '#2E7D32' }}>💼 {lang === 'hi' ? 'नजदीकी रोज़गार के अवसर' : 'Open Local Opportunities'}</h2>
          <Link to="/jobs" style={{ color: '#FF6F00', fontWeight: 600 }}>{lang === 'hi' ? 'सभी देखें →' : 'View All →'}</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {featuredJobs.map(j => {
            const jobCoords = j.location?.geo?.coordinates || j.business?.location?.coordinates || [79.02, 28.80];
            const distanceKm = calculateDistance(jobCoords);

            return (
              <div key={j._id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>{j.title}</h3>
                  <span className="badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>{j.jobType}</span>
                </div>
                <p style={{ color: '#555', fontSize: '0.9rem', margin: '4px 0 6px' }}>
                  🏢 {j.business?.businessName || 'Local Business'} • 📍 {j.location?.city || 'Local area'}
                </p>
                {distanceKm !== null && (
                  <div style={{ fontSize: '0.82rem', color: '#2E7D32', fontWeight: 600, marginBottom: '8px' }}>
                    📍 {distanceKm} km {lang === 'hi' ? 'आपके घर से दूर' : 'from your home'}
                  </div>
                )}
                <div style={{ fontWeight: 'bold', color: '#2E7D32', marginBottom: '12px' }}>
                  ₹{j.salary?.min} - ₹{j.salary?.max} / {lang === 'hi' ? 'महीना' : 'month'}
                </div>
                <Link to={`/jobs/${j._id}`} className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '8px 16px' }}>
                  {t('common.apply')}
                </Link>
              </div>
            );
          })}
          {featuredJobs.length === 0 && (
            <p style={{ color: '#888' }}>{lang === 'hi' ? 'कोई नौकरी उपलब्ध नहीं है।' : 'No open jobs currently.'}</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
