import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { businessService } from '../services';
import { LocationContext } from '../store/locationStore';

const BusinessesPage = () => {
  const { t, lang } = useTranslation();
  const { userLocation, calculateDistance } = useContext(LocationContext);

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Limitation of km filter - enabled by default per user requirement
  const [onlyWithinLimit, setOnlyWithinLimit] = useState(true);
  const [nearestFirst, setNearestFirst] = useState(true);

  useEffect(() => {
    setLoading(true);
    businessService.getBusinesses({ search })
      .then(res => setBusinesses(res.data.data || []))
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, [search]);

  // Compute distance and filter by each business's limitation of km
  const businessesWithDistance = businesses.map(b => {
    const coords = b.location?.coordinates || [79.02, 28.80];
    const distanceKm = calculateDistance(coords);
    const limitKm = b.deliveryRadiusKm || 10;
    const isWithinLimit = distanceKm === null || distanceKm <= limitKm;
    return {
      ...b,
      distanceKm,
      limitKm,
      isWithinLimit
    };
  });

  // Filter according to limitation of km
  let visibleBusinesses = businessesWithDistance.filter(b => {
    if (!onlyWithinLimit) return true;
    return b.isWithinLimit;
  });

  // Sort nearest first if enabled
  if (nearestFirst) {
    visibleBusinesses.sort((a, b) => {
      const distA = a.distanceKm !== null ? a.distanceKm : 9999;
      const distB = b.distanceKm !== null ? b.distanceKm : 9999;
      return distA - distB;
    });
  }

  return (
    <div>
      {/* Header & Location Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#2E7D32', margin: 0 }}>🏪 {t('businesses.title')}</h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            {lang === 'hi'
              ? `आपके स्थान (${userLocation?.name || 'Local Area'}) के सेवा दायरे (km limitation) में दुकानें`
              : `Verified businesses serving your area (${userLocation?.name || 'Local Area'})`}
          </p>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder={lang === 'hi' ? 'दुकान या सेवा खोजें...' : 'Search shops or services...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #ccc', minWidth: '240px', fontSize: '0.95rem' }}
        />
      </div>

      {/* Limitation Filter Controls Card */}
      <div
        className="card"
        style={{
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#fff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Limitation of KM Toggle (Only within radius) */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: onlyWithinLimit ? '#e8f5e9' : '#f5f5f5',
              padding: '7px 12px',
              borderRadius: '6px',
              color: onlyWithinLimit ? '#2E7D32' : '#555',
              fontWeight: 600,
              border: `1px solid ${onlyWithinLimit ? '#c8e6c9' : '#ddd'}`
            }}
          >
            <input
              type="checkbox"
              checked={onlyWithinLimit}
              onChange={(e) => setOnlyWithinLimit(e.target.checked)}
            />
            <span>
              🚚 {lang === 'hi' ? 'केवल सेवा दायरे (km सीमा) की दुकानें' : 'Only Within Service Radius (KM Limit)'}
            </span>
          </label>

          {/* Nearest First Sort */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.88rem',
              cursor: 'pointer',
              background: nearestFirst ? '#e3f2fd' : '#f5f5f5',
              padding: '7px 12px',
              borderRadius: '6px',
              color: nearestFirst ? '#1565c0' : '#555',
              fontWeight: 600,
              border: `1px solid ${nearestFirst ? '#bbdefb' : '#ddd'}`
            }}
          >
            <input
              type="checkbox"
              checked={nearestFirst}
              onChange={(e) => setNearestFirst(e.target.checked)}
            />
            <span>
              📍 {lang === 'hi' ? 'सबसे पास पहले (Nearest First)' : 'Nearest First'}
            </span>
          </label>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#666' }}>
          <strong>{visibleBusinesses.length}</strong> {lang === 'hi' ? 'दुकानें उपलब्ध' : 'businesses found'}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>{t('common.loading')}</div>
      ) : (
        <div className="responsive-grid-cards">
          {visibleBusinesses.map(b => (
            <div key={b._id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#2E7D32' }}>{b.businessName}</h3>
                {b.verificationStatus === 'APPROVED' && (
                  <span className="badge" style={{ background: '#e8f5e9', color: '#2E7D32', fontSize: '0.78rem' }}>
                    ✓ {lang === 'hi' ? 'सत्यापित' : 'Verified'}
                  </span>
                )}
              </div>

              <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '8px' }}>
                🏷️ {b.category || 'General Merchant'}
              </div>

              {/* Distance & Limitation of KM Badge */}
              <div style={{ marginBottom: '12px' }}>
                {b.isWithinLimit ? (
                  <span
                    className="badge"
                    style={{
                      background: '#e8f5e9',
                      color: '#2E7D32',
                      border: '1px solid #c8e6c9',
                      padding: '4px 8px',
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    📍 {lang === 'hi'
                      ? `आपके घर से ~${b.distanceKm !== null ? b.distanceKm : 0} किमी (सेवा दायरा: ${b.limitKm} किमी)`
                      : `~${b.distanceKm !== null ? b.distanceKm : 0} km from home (Serves up to ${b.limitKm} km)`}
                  </span>
                ) : (
                  <span
                    className="badge"
                    style={{
                      background: '#fff3e0',
                      color: '#e65100',
                      border: '1px solid #ffe0b2',
                      padding: '4px 8px',
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ⚠️ {lang === 'hi'
                      ? `~${b.distanceKm} किमी दूर (सेवा सीमा ${b.limitKm} किमी से बाहर)`
                      : `~${b.distanceKm} km away (Beyond ${b.limitKm} km limit)`}
                  </span>
                )}
              </div>

              <p style={{ color: '#555', fontSize: '0.88rem', margin: '0 0 14px', flex: 1, lineHeight: '1.4' }}>
                {b.description || (lang === 'hi' ? 'विश्वसनीय स्थानीय सेवा और उत्पाद' : 'Trusted local enterprise and goods')}
              </p>

              {/* Address & Phone */}
              <div style={{ background: '#f9f9f9', padding: '10px 12px', borderRadius: '6px', fontSize: '0.85rem', color: '#444', marginBottom: '14px' }}>
                <div>📍 {b.address?.street}, {b.address?.city}</div>
                {b.phone && <div style={{ marginTop: '4px' }}>📞 {b.phone}</div>}
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <Link
                  to={`/products?keyword=${encodeURIComponent(b.businessName)}`}
                  className="btn btn-primary"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '8px', fontSize: '0.88rem' }}
                >
                  🌾 {lang === 'hi' ? 'उत्पाद देखें' : 'View Products'}
                </Link>
                {b.phone && (
                  <a
                    href={`tel:${b.phone}`}
                    className="btn"
                    style={{ background: '#e8f5e9', color: '#2E7D32', border: '1px solid #c8e6c9', textDecoration: 'none', padding: '8px 12px', fontSize: '0.88rem' }}
                  >
                    📞
                  </a>
                )}
              </div>
            </div>
          ))}

          {visibleBusinesses.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#777' }}>
              <h3>
                {lang === 'hi'
                  ? 'आपके स्थान के सेवा दायरे (km limitation) में कोई दुकान नहीं मिली'
                  : 'No businesses currently within their km service limitation for your area'}
              </h3>
              <p style={{ margin: '8px 0 16px' }}>
                {onlyWithinLimit
                  ? (lang === 'hi'
                      ? 'अन्य क्षेत्रों की दुकानें देखने के लिए "केवल सेवा दायरे की दुकानें" फ़िल्टर हटाएं।'
                      : 'Uncheck "Only Within Service Radius" to view businesses outside your immediate area.')
                  : (lang === 'hi' ? 'खोज शब्द बदल कर पुनः प्रयास करें।' : 'Try adjusting your search criteria.')}
              </p>
              {onlyWithinLimit && (
                <button
                  type="button"
                  onClick={() => setOnlyWithinLimit(false)}
                  className="btn"
                  style={{ background: '#2E7D32', color: '#fff', padding: '10px 20px' }}
                >
                  {lang === 'hi' ? 'सभी दुकानें देखें (Show All Businesses)' : 'Show All Businesses'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BusinessesPage;
