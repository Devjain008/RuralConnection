import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { CartContext } from '../store/cartStore';

const CartPage = () => {
  const { t, lang } = useTranslation();
  const { cart, removeFromCart, loading } = useContext(CartContext);
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + ((item.priceSnapshot || 0) * (item.quantity || 1)), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>{t('common.loading')}</div>;

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <h1 style={{ color: '#2E7D32', marginBottom: '20px' }}>🛒 {t('nav.cart')}</h1>

      {items.length === 0 ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
          <h2>{lang === 'hi' ? 'आपकी कार्ट खाली है' : 'Your cart is empty'}</h2>
          <p>{lang === 'hi' ? 'बाज़ार में जाकर ताज़ा उत्पाद देखें।' : 'Explore fresh local and wholesale products.'}</p>
          <Link to="/products" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
            {lang === 'hi' ? 'उत्पाद देखें' : 'Browse Products'}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          {/* Items List */}
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {items.map((item, idx) => {
                const prod = item.product || {};
                return (
                  <div key={idx} className="card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ fontSize: '2.5rem', background: '#f5f5f5', padding: '8px 12px', borderRadius: '6px' }}>
                        🌾
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{prod.name || 'Product'}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <span className="badge" style={{ background: item.purchaseType === 'WHOLESALE' ? '#fff3e0' : '#e8f5e9', color: item.purchaseType === 'WHOLESALE' ? '#e65100' : '#2E7D32' }}>
                            {item.purchaseType === 'WHOLESALE' ? '📦 Wholesale Buy' : '🛒 Normal Buy'}
                          </span>
                          <span>₹{item.priceSnapshot} × {item.quantity} {prod.wholesaleUnit || ''}</span>
                        </div>
                        {item.purchaseType === 'WHOLESALE' && prod.packagingDetails && (
                          <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '3px' }}>
                            📦 <em>{prod.packagingDetails}</em>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#2E7D32', fontSize: '1.15rem', marginBottom: '6px' }}>
                        ₹{(item.priceSnapshot || 0) * (item.quantity || 1)}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(prod._id || item.product)}
                        style={{ border: 'none', background: 'transparent', color: '#c62828', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                      >
                        🗑️ {t('common.delete')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Card */}
          <div style={{ flex: '1 1 280px', width: '100%' }}>
            <div className="card" style={{ padding: '24px', position: 'sticky', top: '20px' }}>
              <h3 style={{ margin: '0 0 16px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                {lang === 'hi' ? 'ऑर्डर सारांश' : 'Order Summary'}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
                <span>{lang === 'hi' ? 'उप-कुल (Subtotal):' : 'Subtotal:'}</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.95rem', color: '#666' }}>
                <span>{lang === 'hi' ? 'डिलीवरी शुल्क:' : 'Delivery fee:'}</span>
                <span>{lang === 'hi' ? 'चेकआउट पर तय होगा' : 'Calculated next'}</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '14px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 800 }}>
                <span>{lang === 'hi' ? 'कुल राशि:' : 'Estimated Total:'}</span>
                <span style={{ color: '#2E7D32' }}>₹{subtotal}</span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                {lang === 'hi' ? 'चेकआउट की ओर बढ़ें →' : 'Proceed to Checkout →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
