import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { productService, categoryService } from '../services';
import { LocationContext } from '../store/locationStore';

const PAGE_SIZE = 10; // Production-level shard chunk: exactly 10 products per page

const ProductsPage = () => {
  const { t, lang } = useTranslation();
  const { userLocation, calculateDistance } = useContext(LocationContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Data & Pagination State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Deliverable only filter - enabled by default per user requirement
  const [onlyDeliverable, setOnlyDeliverable] = useState(true);

  // Filters from URL
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const purchaseType = searchParams.get('purchaseType') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const topAnchorRef = useRef(null);

  // Fetch Categories on mount
  useEffect(() => {
    categoryService.getCategories()
      .then(res => setCategories(res.data.data || []))
      .catch(() => {});
  }, []);

  // Primary Data Fetcher for Page
  const fetchProducts = async (pageToFetch = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageToFetch,
        limit: PAGE_SIZE,
      };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (purchaseType) params.purchaseType = purchaseType;

      const res = await productService.getProducts(params);
      const newItems = res.data.data || [];
      const meta = res.data.pagination || {
        page: pageToFetch,
        limit: PAGE_SIZE,
        total: newItems.length,
        totalPages: Math.ceil(newItems.length / PAGE_SIZE) || 1,
        hasNextPage: false,
        hasPrevPage: pageToFetch > 1,
      };

      setProducts(newItems);
      setPagination(meta);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch on filter change or page change
  useEffect(() => {
    fetchProducts(currentPage);
  }, [keyword, category, purchaseType, currentPage]);

  const handleFilterChange = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    next.delete('page'); // Reset to page 1 on filter alteration
    setSearchParams(next);
  };

  // Page change handler: jumps to a specific page
  const handleJumpToPage = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.page) return;
    const next = new URLSearchParams(searchParams);
    next.set('page', newPage);
    setSearchParams(next);

    // Smooth scroll back to top of products catalog
    if (topAnchorRef.current) {
      topAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Distance & Delivery Radius Filter
  const visibleProducts = products.filter(p => {
    if (!onlyDeliverable) return true;
    const shopCoords = p.business?.location?.coordinates || p.location?.coordinates || [79.02, 28.80];
    const distanceKm = calculateDistance(shopCoords);
    const deliveryRadius = p.business?.deliveryRadiusKm || 10;
    return distanceKm === null || distanceKm <= deliveryRadius;
  });

  return (
    <div ref={topAnchorRef}>
      {/* Catalog Header & Location Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#2E7D32', margin: 0 }}>🌾 {t('products.title')}</h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            {lang === 'hi'
              ? `आपके स्थान (${userLocation?.name || 'Local Area'}) के डिलीवरी दायरे में उत्पाद • (10 उत्पाद प्रति पेज)`
              : `Products deliverable to your area (${userLocation?.name || 'Local Area'}) • (10 per page)`}
          </p>
        </div>

        {/* Deliverable Only Filter Toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.88rem',
            cursor: 'pointer',
            background: onlyDeliverable ? '#e8f5e9' : '#f5f5f5',
            padding: '8px 14px',
            borderRadius: '8px',
            color: onlyDeliverable ? '#2E7D32' : '#555',
            fontWeight: 600,
            border: `1px solid ${onlyDeliverable ? '#c8e6c9' : '#ddd'}`
          }}
        >
          <input
            type="checkbox"
            checked={onlyDeliverable}
            onChange={(e) => setOnlyDeliverable(e.target.checked)}
          />
          <span>🚚 {lang === 'hi' ? 'केवल मेरे पते पर डिलीवरी योग्य' : 'Deliverable to Me Only'}</span>
        </label>
      </div>

      {/* Filter Row */}
      <div
        className="card"
        style={{
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          background: '#fff'
        }}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Quick Buy Mode Switcher */}
          <div style={{ display: 'flex', gap: '4px', background: '#f0f0f0', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => handleFilterChange('purchaseType', '')}
              style={{
                border: 'none',
                background: !purchaseType ? '#2E7D32' : 'transparent',
                color: !purchaseType ? '#fff' : '#444',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {lang === 'hi' ? 'सभी' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('purchaseType', 'RETAIL')}
              style={{
                border: 'none',
                background: purchaseType === 'RETAIL' ? '#2E7D32' : 'transparent',
                color: purchaseType === 'RETAIL' ? '#fff' : '#444',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🛒 {lang === 'hi' ? 'खुदरा खरीद' : 'Normal Buy'}
            </button>
            <button
              type="button"
              onClick={() => handleFilterChange('purchaseType', 'WHOLESALE')}
              style={{
                border: 'none',
                background: purchaseType === 'WHOLESALE' ? '#FF6F00' : 'transparent',
                color: purchaseType === 'WHOLESALE' ? '#fff' : '#444',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              📦 {lang === 'hi' ? 'थोक खरीद' : 'Wholesale Buy'}
            </button>
          </div>

          <select
            value={purchaseType}
            onChange={(e) => handleFilterChange('purchaseType', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
          >
            <option value="">{lang === 'hi' ? 'सभी प्रकार (All Types)' : 'All Purchase Types'}</option>
            <option value="RETAIL">{lang === 'hi' ? 'खुदरा (Retail Only)' : 'Retail Only'}</option>
            <option value="WHOLESALE">{lang === 'hi' ? 'थोक (Wholesale Only)' : 'Wholesale Only'}</option>
            <option value="BOTH">{lang === 'hi' ? 'खुदरा व थोक दोनों' : 'Retail & Wholesale'}</option>
          </select>

          <select
            value={category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
          >
            <option value="">{lang === 'hi' ? 'सभी श्रेणियां (Categories)' : 'All Categories'}</option>
            {categories.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Counter Info */}
        <div style={{ fontSize: '0.88rem', color: '#555' }}>
          <strong>
            {lang === 'hi'
              ? `कुल ${pagination.total} उत्पाद • पेज ${pagination.page} / ${pagination.totalPages}`
              : `${pagination.total} products found • Page ${pagination.page} of ${pagination.totalPages}`}
          </strong>
        </div>
      </div>

      {/* Skeleton Loading State */}
      {loading ? (
        <div className="responsive-grid-cards">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton-box" style={{ height: '140px', borderRadius: '8px' }} />
              <div className="skeleton-box" style={{ height: '22px', width: '80%' }} />
              <div className="skeleton-box" style={{ height: '16px', width: '60%' }} />
              <div className="skeleton-box" style={{ height: '40px', width: '100%' }} />
              <div className="skeleton-box" style={{ height: '36px', width: '100%', marginTop: 'auto' }} />
            </div>
          ))}
        </div>
      ) : (
        /* Render Products Grid */
        <div className="responsive-grid-cards">
          {visibleProducts.map(p => {
            const shopCoords = p.business?.location?.coordinates || p.location?.coordinates || [79.02, 28.80];
            const distanceKm = calculateDistance(shopCoords);
            const deliveryRadius = p.business?.deliveryRadiusKm || 10;
            const isDeliverable = distanceKm !== null ? distanceKm <= deliveryRadius : true;

            const isWholesale = p.purchaseType === 'WHOLESALE';
            const isBoth = p.purchaseType === 'BOTH';

            return (
              <div
                key={p._id}
                className="card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderTop: isWholesale ? '3px solid #FF6F00' : (isBoth ? '3px solid #1976D2' : '3px solid #2E7D32')
                }}
              >
                {/* Visual Icon */}
                <div style={{ fontSize: '3.2rem', textAlign: 'center', padding: '18px 0', background: isWholesale ? '#fff8e1' : '#f5f5f5', borderRadius: '8px', marginBottom: '14px' }}>
                  {isWholesale ? '📦' : '🌾'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{p.name}</h3>
                  {isWholesale && (
                    <span className="badge" style={{ background: '#fff3e0', color: '#e65100', border: '1px solid #ffe0b2', fontWeight: 700 }}>
                      📦 WHOLESALE BUY
                    </span>
                  )}
                  {p.purchaseType === 'RETAIL' && (
                    <span className="badge" style={{ background: '#e8f5e9', color: '#2E7D32', border: '1px solid #c8e6c9', fontWeight: 700 }}>
                      🛒 NORMAL BUY
                    </span>
                  )}
                  {isBoth && (
                    <span className="badge" style={{ background: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', fontWeight: 700 }}>
                      🛒 Retail & 📦 Wholesale
                    </span>
                  )}
                </div>

                {/* Shopkeeper & Delivery Info */}
                <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '6px' }}>
                  🏪 {p.business?.businessName || 'Local Seller'}
                </div>

                {/* Location Delivery Range Badge */}
                <div style={{ marginBottom: '10px' }}>
                  {isDeliverable ? (
                    <span style={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      🚚 {lang === 'hi' ? `डिलीवरी उपलब्ध (~${distanceKm || 0} किमी, दायरा: ${deliveryRadius} किमी)` : `Delivery Available (~${distanceKm || 0} km, up to ${deliveryRadius} km)`}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#c62828', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      ⚠️ {lang === 'hi' ? `डिलीवरी से बाहर (~${distanceKm || 0} किमी) • दुकान से पिकअप उपलब्ध` : `Out of Delivery Range (~${distanceKm || 0} km) • Pickup only`}
                    </span>
                  )}
                </div>

                <p style={{ color: '#555', fontSize: '0.85rem', flex: 1, margin: '0 0 12px', lineHeight: '1.4' }}>
                  {p.description?.slice(0, 85)}...
                </p>

                {/* Pricing Box */}
                {isWholesale ? (
                  <div style={{ background: '#fff8e1', border: '1px solid #ffe082', padding: '10px', borderRadius: '6px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#b78103', fontWeight: 600 }}>{lang === 'hi' ? 'थोक मूल्य:' : 'Wholesale Price:'}</span>
                      <strong style={{ color: '#e65100', fontSize: '1.25rem' }}>
                        ₹{p.wholesalePrice || p.price} <span style={{ fontSize: '0.78rem', color: '#666', fontWeight: 'normal' }}>/{p.wholesaleUnit || 'unit'}</span>
                      </strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#d84315', fontWeight: 600 }}>
                      ⚠️ {lang === 'hi' ? `न्यूनतम थोक मात्रा (MOQ): ${p.minimumWholesaleQuantity} ${p.wholesaleUnit || 'यूनिट'}` : `Min. Order (MOQ): ${p.minimumWholesaleQuantity} ${p.wholesaleUnit || 'units'}`}
                    </div>
                    {p.packagingDetails && (
                      <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '3px' }}>
                        📦 <em>{p.packagingDetails}</em>
                      </div>
                    )}
                    {p.wholesaleTerms && (
                      <div style={{ fontSize: '0.78rem', color: '#2E7D32', marginTop: '3px', fontWeight: 600 }}>
                        🏷️ {p.wholesaleTerms}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '6px', marginBottom: '14px', border: '1px solid #eee' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>{t('products.retail')}:</span>
                      <strong style={{ color: '#2E7D32', fontSize: '1.15rem' }}>₹{p.price}</strong>
                    </div>
                    {p.wholesalePrice && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: '#555' }}>{t('products.wholesale')} (MOQ {p.minimumWholesaleQuantity}):</span>
                        <strong style={{ color: '#e65100' }}>₹{p.wholesalePrice}</strong>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '8px' }}>
                  <span className="badge" style={{ background: p.stock > 0 ? '#e8f5e9' : '#ffebee', color: p.stock > 0 ? '#2E7D32' : '#c62828' }}>
                    {p.stock > 0 ? (lang === 'hi' ? `स्टॉक: ${p.stock}` : `Stock: ${p.stock}`) : (lang === 'hi' ? 'स्टॉक खत्म' : 'Out of Stock')}
                  </span>
                  {isWholesale ? (
                    <Link
                      to={`/products/${p._id}`}
                      className="btn"
                      style={{
                        background: '#FF6F00',
                        color: '#fff',
                        padding: '8px 14px',
                        textDecoration: 'none',
                        fontWeight: 600,
                        borderRadius: '6px'
                      }}
                    >
                      📦 {lang === 'hi' ? 'थोक खरीद' : 'Wholesale Buy'}
                    </Link>
                  ) : (
                    <Link
                      to={`/products/${p._id}`}
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', textDecoration: 'none' }}
                    >
                      {isBoth ? t('common.viewDetails') : `🛒 ${lang === 'hi' ? 'खुदरा खरीद' : 'Normal Buy'}`}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {visibleProducts.length === 0 && (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#777' }}>
              <h3>{lang === 'hi' ? 'आपके डिलीवरी दायरे में कोई उत्पाद नहीं मिला' : 'No products found'}</h3>
              <p style={{ margin: '8px 0 16px' }}>
                {onlyDeliverable
                  ? (lang === 'hi'
                      ? 'दुकानदारों के डिलीवरी दायरे से बाहर के उत्पाद देखने के लिए फ़िल्टर हटाएं (पिकअप के लिए)।'
                      : 'Uncheck "Deliverable to Me Only" to view products for in-store pickup.')
                  : (lang === 'hi' ? 'फ़िल्टर बदल कर पुनः प्रयास करें।' : 'Try adjusting your search criteria.')}
              </p>
              {onlyDeliverable && (
                <button
                  type="button"
                  onClick={() => setOnlyDeliverable(false)}
                  className="btn"
                  style={{ background: '#2E7D32', color: '#fff', padding: '10px 20px' }}
                >
                  {lang === 'hi' ? 'सभी उत्पाद देखें (दुकान से पिकअप हेतु)' : 'Show All Products (For Store Pickup)'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Clean Pagination Bar */}
      {!loading && pagination.total > 0 && pagination.totalPages > 1 && (
        <div style={{ marginTop: '36px', textAlign: 'center' }}>
          <div className="pagination-container">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => handleJumpToPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="pagination-btn"
              title="Previous Page"
            >
              « {lang === 'hi' ? 'पिछला' : 'Prev'}
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handleJumpToPage(pageNum)}
                className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              type="button"
              onClick={() => handleJumpToPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="pagination-btn"
              title="Next Page"
            >
              {lang === 'hi' ? 'अगला' : 'Next'} »
            </button>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#777' }}>
            {lang === 'hi'
              ? `पेज ${pagination.page} / ${pagination.totalPages} (10 उत्पाद प्रति पेज)`
              : `Page ${pagination.page} of ${pagination.totalPages} (10 products per page)`}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
