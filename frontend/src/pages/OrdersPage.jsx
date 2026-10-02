import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { orderService } from '../services';

const statusColors = {
  PENDING: { bg: '#fff3e0', text: '#e65100' },
  CONFIRMED: { bg: '#e3f2fd', text: '#1565c0' },
  PREPARING: { bg: '#ede7f6', text: '#512da8' },
  READY: { bg: '#e0f2f1', text: '#00695c' },
  READY_FOR_PICKUP: { bg: '#e0f7fa', text: '#00838f' },
  OUT_FOR_DELIVERY: { bg: '#fff8e1', text: '#f57f17' },
  DELIVERED: { bg: '#e8f5e9', text: '#2e7d32' },
  PICKED_UP: { bg: '#e8f5e9', text: '#2e7d32' },
  CANCELLED: { bg: '#ffebee', text: '#c62828' },
};

const OrdersPage = () => {
  const { lang } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    orderService.getMyOrders()
      .then(res => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (id) => {
    if (window.confirm(lang === 'hi' ? 'क्या आप इस ऑर्डर को रद्द करना चाहते हैं?' : 'Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to cancel order');
      }
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <h1 style={{ color: '#2E7D32', marginBottom: '24px' }}>
        🛍️ {lang === 'hi' ? 'मेरे ऑर्डर और ट्रैकिंग' : 'My Orders & Tracking'}
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '50px', textAlign: 'center', color: '#666' }}>
          <h3>{lang === 'hi' ? 'आपने अभी तक कोई ऑर्डर नहीं दिया है' : 'No orders found'}</h3>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const style = statusColors[order.orderStatus] || { bg: '#f5f5f5', text: '#333' };
            return (
              <div key={order._id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>
                      {lang === 'hi' ? 'ऑर्डर #' : 'Order #'}{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      📅 {new Date(order.createdAt).toLocaleDateString()} • 🏪 {order.seller?.name || 'Local Seller'}
                    </div>
                  </div>

                  <span className="badge" style={{ background: style.bg, color: style.text, fontSize: '0.88rem', padding: '6px 12px' }}>
                    ● {order.orderStatus}
                  </span>
                </div>

                {/* Items in Order */}
                <div style={{ background: '#fafafa', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
                  {order.items?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', padding: '4px 0' }}>
                      <span>
                        🌾 {item.name} × {item.quantity} ({item.purchaseType})
                      </span>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                {/* Pickup Code display if pickup */}
                {order.pickupInfo?.isPickup && (
                  <div style={{ background: '#e0f7fa', color: '#006064', padding: '10px 14px', borderRadius: '6px', marginBottom: '14px', fontSize: '0.9rem' }}>
                    🏪 <strong>{lang === 'hi' ? 'पिकअप कोड:' : 'Pickup Verification Code:'}</strong> {order.pickupInfo.pickupCode}
                  </div>
                )}

                {/* Footer and Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                    {lang === 'hi' ? 'कुल राशि:' : 'Total:'} <span style={{ color: '#2E7D32' }}>₹{order.total}</span>
                  </div>

                  {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
                    <button
                      type="button"
                      onClick={() => handleCancel(order._id)}
                      style={{ border: '1px solid #c62828', background: 'transparent', color: '#c62828', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      {lang === 'hi' ? 'ऑर्डर रद्द करें' : 'Cancel Order'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
