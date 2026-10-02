import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { orderService } from '../services';
import { CartContext } from '../store/cartStore';

const CheckoutPage = () => {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const { cart, fetchCart } = useContext(CartContext);

  const [isPickup, setIsPickup] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items || [];
  const subtotal = items.reduce((sum, item) => sum + ((item.priceSnapshot || 0) * (item.quantity || 1)), 0);
  const deliveryFee = isPickup ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await orderService.checkout({
        isPickup,
        deliveryAddress: isPickup ? {} : address
      });
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please review stock and MOQ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <h1 style={{ color: '#2E7D32', marginBottom: '24px' }}>
        📦 {lang === 'hi' ? 'चेकआउट और डिलीवरी' : 'Checkout & Delivery'}
      </h1>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Delivery Mode Choice */}
        <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '14px' }}>{lang === 'hi' ? 'प्राप्ति का तरीका चुनें' : 'Select Fulfillment Method'}</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 16px', border: !isPickup ? '2px solid #2E7D32' : '1px solid #ccc', borderRadius: '8px', background: !isPickup ? '#e8f5e9' : '#fff' }}>
              <input type="radio" name="fulfillment" checked={!isPickup} onChange={() => setIsPickup(false)} />
              <div>
                <strong>🚚 {lang === 'hi' ? 'घर पर डिलीवरी' : 'Home Delivery'}</strong>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>₹50 {lang === 'hi' ? 'शुल्क' : 'flat fee'}</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 16px', border: isPickup ? '2px solid #2E7D32' : '1px solid #ccc', borderRadius: '8px', background: isPickup ? '#e8f5e9' : '#fff' }}>
              <input type="radio" name="fulfillment" checked={isPickup} onChange={() => setIsPickup(true)} />
              <div>
                <strong>🏪 {lang === 'hi' ? 'दुकान से पिकअप' : 'Store Pickup'}</strong>
                <div style={{ fontSize: '0.8rem', color: '#2E7D32' }}>{lang === 'hi' ? 'मुफ़्त (Free)' : 'Free'}</div>
              </div>
            </label>
          </div>
        </div>

        {/* Address Input if Delivery */}
        {!isPickup && (
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '14px' }}>{lang === 'hi' ? 'डिलीवरी का पता' : 'Delivery Address'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                  {lang === 'hi' ? 'गाँव / सड़क / मकान संख्या (Street / Village / House):' : 'Street Address / Village:'}
                </label>
                <input
                  type="text"
                  required
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                    {lang === 'hi' ? 'शहर / कस्बा (City / Town):' : 'City / Town:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                    {lang === 'hi' ? 'राज्य (State):' : 'State:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                    {lang === 'hi' ? 'पिनकोड (Pincode):' : 'Pincode:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final Price Breakdown */}
        <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '14px' }}>{lang === 'hi' ? 'भुगतान राशि' : 'Order Total'}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span>{lang === 'hi' ? 'समान का मूल्य:' : 'Items Subtotal:'}</span>
            <span>₹{subtotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span>{lang === 'hi' ? 'डिलीवरी शुल्क:' : 'Delivery Fee:'}</span>
            <span>{isPickup ? (lang === 'hi' ? 'मुफ़्त' : 'Free') : `₹${deliveryFee}`}</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
            <span>{lang === 'hi' ? 'देय कुल राशि:' : 'Total Payable:'}</span>
            <span style={{ color: '#2E7D32' }}>₹{total}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
        >
          {loading ? (lang === 'hi' ? 'ऑर्डर प्रोसेस हो रहा है...' : 'Processing...') : (lang === 'hi' ? 'ऑर्डर कन्फर्म करें (Place Order)' : 'Place Order')}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
