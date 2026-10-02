import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { productService } from '../services';
import { CartContext } from '../store/cartStore';
import { AuthContext } from '../store/authStore';
import { LocationContext } from '../store/locationStore';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useTranslation();
  const { addToCart } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { userLocation, calculateDistance } = useContext(LocationContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchaseType, setPurchaseType] = useState('RETAIL');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    productService.getProduct(id)
      .then(res => {
        const prod = res.data.data;
        setProduct(prod);
        if (prod.purchaseType === 'WHOLESALE') {
          setPurchaseType('WHOLESALE');
          setQuantity(prod.minimumWholesaleQuantity || 50);
        }
      })
      .catch(err => setError(err.response?.data?.message || 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleTypeChange = (type) => {
    setPurchaseType(type);
    if (type === 'WHOLESALE') {
      setQuantity(Math.max(quantity, product.minimumWholesaleQuantity || 50));
    } else {
      setQuantity(1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAdding(true);
    setError('');
    setSuccessMsg('');
    try {
      await addToCart(product._id, quantity, purchaseType);
      setSuccessMsg(lang === 'hi' ? 'कार्ट में जोड़ दिया गया!' : 'Successfully added to cart!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>{t('common.loading')}</div>;
  if (error && !product) return <div style={{ textAlign: 'center', padding: '60px', color: '#c62828' }}>⚠️ {error}</div>;

  const currentPrice = purchaseType === 'WHOLESALE' ? (product.wholesalePrice || product.price) : product.price;
  const totalPrice = currentPrice * quantity;

  // Delivery radius logic
  const shopCoords = product.business?.location?.coordinates || product.location?.coordinates || [79.02, 28.80];
  const distanceKm = calculateDistance(shopCoords);
  const deliveryRadius = product.business?.deliveryRadiusKm || 10;
  const isDeliverable = distanceKm !== null ? distanceKm <= deliveryRadius : true;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn" style={{ background: '#eee', marginBottom: '20px' }}>
        ← {lang === 'hi' ? 'वापस जाएं' : 'Back'}
      </button>

      <div className="card responsive-product-detail" style={{ padding: '24px' }}>
        {/* Visual / Image area */}
        <div>
          <div style={{ background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', fontSize: '6rem' }}>
            🌾
          </div>

          {/* Shopkeeper Details Box */}
          <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '16px', borderRadius: '8px', border: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 8px', color: '#2E7D32' }}>
              🏪 {lang === 'hi' ? 'दुकानदार का विवरण' : 'Shopkeeper & Location'}
            </h4>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
              {product.business?.businessName || 'Local Business'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              📍 {product.business?.address?.street || 'Local Market'}, {product.business?.address?.city || 'Town'}
            </div>
            {product.business?.phone && (
              <div style={{ fontSize: '0.85rem', color: '#555', marginTop: '2px' }}>
                📞 Phone: {product.business.phone}
              </div>
            )}
          </div>
        </div>

        {/* Details & Buy Action */}
        <div>
          <span className="badge" style={{ background: '#e8f5e9', color: '#2E7D32', marginBottom: '8px' }}>
            {product.category?.name || 'General'}
          </span>
          <h1 style={{ margin: '4px 0 12px', fontSize: '1.8rem' }}>{product.name}</h1>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
            {product.description || (lang === 'hi' ? 'कोई अतिरिक्त विवरण नहीं दिया गया है।' : 'No additional description provided.')}
          </p>

          {/* Location & Delivery Availability Box */}
          <div
            style={{
              background: isDeliverable ? '#e8f5e9' : '#fff3e0',
              border: `1.5px solid ${isDeliverable ? '#a5d6a7' : '#ffcc80'}`,
              borderRadius: '8px',
              padding: '14px',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: isDeliverable ? '#2E7D32' : '#e65100', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{isDeliverable ? '🚚' : '⚠️'}</span>
              <span>
                {isDeliverable
                  ? (lang === 'hi' ? 'आपके पते पर डिलीवरी उपलब्ध है!' : 'Delivery Available to Your Location!')
                  : (lang === 'hi' ? 'सीधी डिलीवरी उपलब्ध नहीं (पिकअप संभव)' : 'Delivery Outside Area (Pickup Available)')}
              </span>
            </div>
            <div style={{ fontSize: '0.86rem', color: '#444', marginTop: '6px' }}>
              {distanceKm !== null
                ? (lang === 'hi'
                    ? `आपकी दुकान से दूरी: ${distanceKm} किमी • दुकान का अधिकतम डिलीवरी दायरा: ${deliveryRadius} किमी`
                    : `Distance from shop: ~${distanceKm} km • Shop delivery radius: ${deliveryRadius} km`)
                : `Shop delivery limit: ${deliveryRadius} km`}
            </div>
            {!isDeliverable && (
              <div style={{ fontSize: '0.82rem', color: '#d84315', marginTop: '4px', fontWeight: 600 }}>
                {lang === 'hi'
                  ? '💡 आप यह सामान ऑर्डर करके सीधे दुकान से पिकअप (Store Pickup) कर सकते हैं।'
                  : '💡 You can still place an order and collect it directly from the store (Store Pickup).'}
              </div>
            )}
          </div>

          {/* Pricing Options */}
          <div
            style={{
              background: purchaseType === 'WHOLESALE' ? '#fff8e1' : '#fafafa',
              border: purchaseType === 'WHOLESALE' ? '1.5px solid #ffe082' : '1px solid #eee',
              borderRadius: '8px',
              padding: '18px',
              marginBottom: '20px'
            }}
          >
            {product.purchaseType === 'BOTH' && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => handleTypeChange('RETAIL')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: purchaseType === 'RETAIL' ? '2px solid #2E7D32' : '1px solid #ccc',
                    background: purchaseType === 'RETAIL' ? '#e8f5e9' : '#fff',
                    color: purchaseType === 'RETAIL' ? '#2E7D32' : '#333',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🛒 {lang === 'hi' ? 'खुदरा खरीद (Normal Buy)' : 'Normal Buy (Retail)'} (₹{product.price})
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('WHOLESALE')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: purchaseType === 'WHOLESALE' ? '2px solid #FF6F00' : '1px solid #ccc',
                    background: purchaseType === 'WHOLESALE' ? '#fff3e0' : '#fff',
                    color: purchaseType === 'WHOLESALE' ? '#FF6F00' : '#333',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📦 {lang === 'hi' ? 'थोक खरीद (Wholesale Buy)' : 'Wholesale Buy (Bulk)'} (₹{product.wholesalePrice})
                </button>
              </div>
            )}

            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: purchaseType === 'WHOLESALE' ? '#e65100' : '#2E7D32', marginBottom: '8px' }}>
              ₹{currentPrice} <span style={{ fontSize: '0.9rem', color: '#777', fontWeight: 'normal' }}>/ {product.wholesaleUnit || 'unit'}</span>
            </div>

            {purchaseType === 'WHOLESALE' && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.9rem', color: '#d84315', fontWeight: 600 }}>
                  ⚠️ {lang === 'hi' ? `न्यूनतम थोक मात्रा (MOQ): ${product.minimumWholesaleQuantity} ${product.wholesaleUnit || 'यूनिट'}` : `Minimum Wholesale Quantity (MOQ): ${product.minimumWholesaleQuantity} ${product.wholesaleUnit || 'units'}`}
                </div>
                {product.packagingDetails && (
                  <div style={{ fontSize: '0.85rem', color: '#444' }}>
                    📦 <strong>{lang === 'hi' ? 'पैकेजिंग / लॉट:' : 'Packaging / Lot Size:'}</strong> {product.packagingDetails}
                  </div>
                )}
                {product.wholesaleTerms && (
                  <div style={{ fontSize: '0.85rem', color: '#2E7D32', background: '#e8f5e9', padding: '6px 10px', borderRadius: '4px', fontWeight: 600 }}>
                    🏷️ <strong>{lang === 'hi' ? 'थोक शर्तें:' : 'Bulk Terms:'}</strong> {product.wholesaleTerms}
                  </div>
                )}
              </div>
            )}

            <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '10px' }}>
              📦 {lang === 'hi' ? `उपलब्ध स्टॉक: ${product.stock}` : `Stock Available: ${product.stock}`} {product.wholesaleUnit || 'units'}
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <label style={{ fontWeight: 600 }}>{lang === 'hi' ? 'मात्रा (Quantity):' : 'Quantity:'}</label>
            <input
              type="number"
              min={purchaseType === 'WHOLESALE' ? product.minimumWholesaleQuantity : 1}
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                const val = Number(e.target.value);
                const minVal = purchaseType === 'WHOLESALE' ? (product.minimumWholesaleQuantity || 1) : 1;
                setQuantity(Math.max(val, minVal));
              }}
              style={{ width: '90px', padding: '8px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
            />
            <div style={{ fontWeight: 600, color: '#333' }}>
              {lang === 'hi' ? 'कुल राशि:' : 'Subtotal:'} <span style={{ color: purchaseType === 'WHOLESALE' ? '#e65100' : '#2E7D32', fontSize: '1.15rem' }}>₹{totalPrice}</span>
            </div>
          </div>

          {error && <div style={{ color: '#c62828', marginBottom: '12px', fontSize: '0.9rem' }}>⚠️ {error}</div>}
          {successMsg && <div style={{ color: '#2E7D32', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 600 }}>✓ {successMsg}</div>}

          {/* Add to Cart button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || product.stock <= 0}
            className="btn"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1.05rem',
              fontWeight: 700,
              background: purchaseType === 'WHOLESALE' ? '#FF6F00' : '#2E7D32',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: (adding || product.stock <= 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {adding
              ? (lang === 'hi' ? 'जोड़ा जा रहा है...' : 'Adding...')
              : purchaseType === 'WHOLESALE'
                ? (lang === 'hi' ? `📦 कार्ट में थोक जोड़ें (₹${totalPrice})` : `📦 Add to Cart (Wholesale Buy) • ₹${totalPrice}`)
                : (lang === 'hi' ? `🛒 कार्ट में जोड़ें (₹${totalPrice})` : `🛒 Add to Cart (Normal Buy) • ₹${totalPrice}`)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
