import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { businessService, productService, jobService, orderService, aiService, categoryService } from '../services';

const RetailerDashboard = () => {
  const { lang } = useTranslation();
  const [activeTab, setActiveTab] = useState('products'); // 'business' | 'products' | 'jobs' | 'orders'

  // Business State
  const [business, setBusiness] = useState(null);
  const [bizForm, setBizForm] = useState({
    businessName: '', category: 'Agri & Retail', phone: '',
    street: '', city: '', state: '', pincode: '',
    lng: 79.02, lat: 28.80
  });

  // Products State
  const [myProducts, setMyProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [prodForm, setProdForm] = useState({
    name: '', description: '', category: '', price: '',
    stock: 100, purchaseType: 'RETAIL'
  });

  // Dedicated Wholesale Product State
  const [wholesaleForm, setWholesaleForm] = useState({
    name: '', description: '', category: '', wholesalePrice: '',
    minimumWholesaleQuantity: 50, stock: 500, wholesaleUnit: 'kg',
    packagingDetails: '', wholesaleTerms: '', purchaseType: 'WHOLESALE'
  });

  // Jobs State
  const [myJobs, setMyJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: '', description: '', qualification: '10th Pass',
    minSalary: 12000, maxSalary: 18000, jobType: 'FULL_TIME', skills: ''
  });
  const [aiClassification, setAiClassification] = useState(null);
  const [classifying, setClassifying] = useState(false);

  // Orders State
  const [sellerOrders, setSellerOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [bizRes, catRes, prodRes, jobRes, ordRes] = await Promise.allSettled([
        businessService.getMyBusiness(),
        categoryService.getCategories(),
        productService.getMyProducts(),
        jobService.getMyJobs(),
        orderService.getSellerOrders()
      ]);

      if (bizRes.status === 'fulfilled') {
        const b = bizRes.value.data?.data;
        setBusiness(b);
        if (b) {
          setBizForm({
            businessName: b.businessName || '',
            category: b.category || '',
            phone: b.phone || '',
            street: b.address?.street || '',
            city: b.address?.city || '',
            state: b.address?.state || '',
            pincode: b.address?.pincode || '',
            deliveryRadiusKm: b.deliveryRadiusKm || 10,
            lng: b.location?.coordinates?.[0] || 79.02,
            lat: b.location?.coordinates?.[1] || 28.80
          });
        }
      }

      if (catRes.status === 'fulfilled') {
        const cats = catRes.value.data?.data || [];
        setCategories(cats);
        if (cats.length > 0) {
          setProdForm(p => p.category ? p : { ...p, category: cats[0]._id });
          setWholesaleForm(w => w.category ? w : { ...w, category: cats[0]._id });
        }
      }

      if (prodRes.status === 'fulfilled') setMyProducts(prodRes.value.data?.data || []);
      if (jobRes.status === 'fulfilled') setMyJobs(jobRes.value.data?.data || []);
      if (ordRes.status === 'fulfilled') setSellerOrders(ordRes.value.data?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save / Update Business
  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    try {
      await businessService.createBusiness({
        businessName: bizForm.businessName,
        category: bizForm.category,
        phone: bizForm.phone,
        deliveryRadiusKm: Number(bizForm.deliveryRadiusKm) || 10,
        address: { street: bizForm.street, city: bizForm.city, state: bizForm.state, pincode: bizForm.pincode },
        location: { type: 'Point', coordinates: [Number(bizForm.lng), Number(bizForm.lat)] }
      });
      setMessage(lang === 'hi' ? 'दुकान का विवरण सहेज लिया गया!' : 'Business saved successfully!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving business');
    }
  };

  // Add Retail Product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct({
        name: prodForm.name,
        description: prodForm.description,
        category: prodForm.category,
        price: Number(prodForm.price),
        stock: Number(prodForm.stock),
        purchaseType: 'RETAIL'
      });
      setMessage(lang === 'hi' ? 'खुदरा उत्पाद सफलतापूर्वक जोड़ा गया!' : 'Retail product added successfully!');
      setProdForm({ name: '', description: '', category: categories[0]?._id || '', price: '', stock: 100, purchaseType: 'RETAIL' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding product. Check business verification.');
    }
  };

  // Add Wholesale Product
  const handleAddWholesaleProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct({
        name: wholesaleForm.name,
        description: wholesaleForm.description,
        category: wholesaleForm.category,
        price: Number(wholesaleForm.wholesalePrice),
        wholesalePrice: Number(wholesaleForm.wholesalePrice),
        minimumWholesaleQuantity: Number(wholesaleForm.minimumWholesaleQuantity),
        stock: Number(wholesaleForm.stock),
        wholesaleUnit: wholesaleForm.wholesaleUnit,
        packagingDetails: wholesaleForm.packagingDetails,
        wholesaleTerms: wholesaleForm.wholesaleTerms,
        purchaseType: 'WHOLESALE'
      });
      setMessage(lang === 'hi' ? 'थोक उत्पाद सफलतापूर्वक जोड़ा गया!' : 'Wholesale product listed successfully!');
      setWholesaleForm({
        name: '', description: '', category: categories[0]?._id || '', wholesalePrice: '',
        minimumWholesaleQuantity: 50, stock: 500, wholesaleUnit: 'kg',
        packagingDetails: '', wholesaleTerms: '', purchaseType: 'WHOLESALE'
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding wholesale product. Check business verification.');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      await productService.deleteProduct(id);
      loadData();
    }
  };

  // AI Job Classification
  const handleClassifyJob = async () => {
    if (!jobForm.title || !jobForm.description) {
      alert(lang === 'hi' ? 'कृपया पहले नौकरी का शीर्षक और विवरण भरें' : 'Please fill job title and description first');
      return;
    }
    setClassifying(true);
    setAiClassification(null);
    try {
      const res = await aiService.classifyJob({
        title: jobForm.title,
        description: jobForm.description,
        skills: jobForm.skills,
        qualification: jobForm.qualification
      });
      setAiClassification(res.data?.data);
      if (res.data?.data?.recommendedSkills) {
        setJobForm(prev => ({
          ...prev,
          skills: res.data.data.recommendedSkills.join(', ')
        }));
      }
    } catch (err) {
      alert('AI classification service unavailable');
    } finally {
      setClassifying(false);
    }
  };

  // Post Job
  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await jobService.createJob({
        title: jobForm.title,
        description: jobForm.description,
        qualification: jobForm.qualification,
        salary: { min: Number(jobForm.minSalary), max: Number(jobForm.maxSalary) },
        jobType: jobForm.jobType,
        skills: jobForm.skills.split(',').map(s => s.trim())
      });
      setMessage(lang === 'hi' ? 'नौकरी सफलतापूर्वक पोस्ट की गई!' : 'Job posted successfully!');
      setJobForm({ title: '', description: '', qualification: '10th Pass', minSalary: 12000, maxSalary: 18000, jobType: 'FULL_TIME', skills: '' });
      setAiClassification(null);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting job');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#2E7D32', margin: 0 }}>🏪 {lang === 'hi' ? 'दुकानदार / विक्रेता पोर्टल' : 'Retailer Business Portal'}</h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            {business?.businessName ? `${business.businessName} • Status: ${business.verificationStatus}` : (lang === 'hi' ? 'अपनी दुकान पंजीकृत करें और सामान व नौकरियां जोड़ें' : 'Manage products, jobs, and customer orders')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: '#e0e0e0', padding: '4px', borderRadius: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'products', label: lang === 'hi' ? '🛒 खुदरा उत्पाद' : '🛒 Retail Products' },
            { id: 'wholesale', label: lang === 'hi' ? '📦 थोक उत्पाद' : '📦 Wholesale Products' },
            { id: 'jobs', label: lang === 'hi' ? '💼 नौकरी पोस्टिंग' : 'Jobs' },
            { id: 'orders', label: lang === 'hi' ? '🛍️ ग्राहक ऑर्डर' : `Orders (${sellerOrders.length})` },
            { id: 'business', label: lang === 'hi' ? '⚙️ दुकान प्रोफ़ाइल' : 'Business Info' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: 'none',
                background: activeTab === tab.id ? (tab.id === 'wholesale' ? '#FF6F00' : '#2E7D32') : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#333',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div style={{ background: '#e8f5e9', color: '#2E7D32', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontWeight: 600 }}>
          ✓ {message}
        </div>
      )}

      {/* Verification Notice */}
      {business && business.verificationStatus === 'PENDING' && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', color: '#e65100', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
          ⏳ <strong>{lang === 'hi' ? 'सत्यापन प्रक्रियाधीन:' : 'Verification Pending:'}</strong> {lang === 'hi' ? 'आपकी दुकान एडमिन सत्यापन की प्रतीक्षा में है। सत्यापन के बाद आपके उत्पाद सार्वजनिक खोज में दिखाई देंगे।' : 'Your business is awaiting admin verification.'}
        </div>
      )}

      {/* TAB 1: RETAIL PRODUCTS */}
      {activeTab === 'products' && (
        <div className="responsive-product-detail">
          {/* Add Retail Product Form */}
          <div className="card" style={{ padding: '24px', borderTop: '4px solid #2E7D32' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, color: '#2E7D32' }}>🛒 {lang === 'hi' ? 'नया खुदरा उत्पाद जोड़ें (Retail)' : 'Add Retail Product (Normal Buy)'}</h3>
              <button
                type="button"
                onClick={() => setActiveTab('wholesale')}
                style={{ background: '#fff3e0', border: '1px solid #ffcc80', color: '#e65100', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                📦 {lang === 'hi' ? 'थोक उत्पाद बेचना चाहते हैं? यहाँ क्लिक करें →' : 'Switch to Wholesale Form →'}
              </button>
            </div>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 16px' }}>
              {lang === 'hi' ? 'सामान्य खुदरा ग्राहकों के लिए उत्पाद और मूल्य निर्धारित करें।' : 'List normal retail items for regular consumer purchases.'}
            </p>

            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'उत्पाद का नाम:' : 'Product Name:'}</label>
                <input type="text" required placeholder={lang === 'hi' ? 'उदा. ताज़ा बासमती चावल' : 'e.g. Fresh Basmati Rice'} value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'श्रेणी (Category):' : 'Category:'}</label>
                <select value={prodForm.category} onChange={e => setProdForm({ ...prodForm, category: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'खुदरा मूल्य (₹):' : 'Retail Price (₹):'}</label>
                  <input type="number" required placeholder="e.g. 60" value={prodForm.price} onChange={e => setProdForm({ ...prodForm, price: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'कुल स्टॉक (इकाई):' : 'Retail Stock (Units):'}</label>
                  <input type="number" required value={prodForm.stock} onChange={e => setProdForm({ ...prodForm, stock: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'विवरण:' : 'Description:'}</label>
                <textarea rows={2} placeholder={lang === 'hi' ? 'उत्पाद का संक्षिप्त विवरण लिखें...' : 'Brief description of the product...'} value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px' }}>
                🛒 {lang === 'hi' ? 'खुदरा उत्पाद प्रकाशित करें' : 'Publish Retail Product'}
              </button>
            </form>
          </div>

          {/* List of Retail Products */}
          <div>
            <h3 style={{ margin: '0 0 16px', color: '#2E7D32' }}>🛒 {lang === 'hi' ? 'मेरे खुदरा उत्पाद' : 'My Retail Products'} ({myProducts.filter(p => p.purchaseType === 'RETAIL' || p.purchaseType === 'BOTH').length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myProducts.filter(p => p.purchaseType === 'RETAIL' || p.purchaseType === 'BOTH').length === 0 ? (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#777' }}>
                  {lang === 'hi' ? 'कोई खुदरा उत्पाद नहीं मिला।' : 'No retail products listed yet.'}
                </div>
              ) : (
                myProducts.filter(p => p.purchaseType === 'RETAIL' || p.purchaseType === 'BOTH').map(p => (
                  <div key={p._id} className="card" style={{ padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px' }}>🌾 {p.name}</h4>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        Retail Price: <strong>₹{p.price}</strong> • Stock: {p.stock}
                      </div>
                    </div>
                    <button type="button" onClick={() => handleDeleteProduct(p._id)} style={{ border: 'none', background: 'transparent', color: '#c62828', cursor: 'pointer', fontSize: '1.1rem' }} title="Delete Product">
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHOLESALE PRODUCTS (INDEPENDENT FORM) */}
      {activeTab === 'wholesale' && (
        <div className="responsive-product-detail">
          {/* Add Wholesale Product Form */}
          <div className="card" style={{ padding: '24px', borderTop: '4px solid #FF6F00' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.4rem' }}>📦</span>
              <h3 style={{ margin: 0, color: '#e65100' }}>
                {lang === 'hi' ? 'नया थोक उत्पाद जोड़ें (Wholesale Listing)' : 'Add Wholesale Product (Bulk Listing)'}
              </h3>
            </div>
            <p style={{ color: '#666', fontSize: '0.85rem', margin: '0 0 16px' }}>
              {lang === 'hi'
                ? 'थोक खरीदारों के लिए उत्पाद, न्यूनतम ऑर्डर मात्रा (MOQ), पैकेजिंग और छूट की शर्तें अलग से निर्धारित करें।'
                : 'List bulk inventory independently with custom MOQ, packaging, and tiered terms for wholesale buyers.'}
            </p>

            <form onSubmit={handleAddWholesaleProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'थोक उत्पाद का नाम:' : 'Wholesale Product Name:'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'hi' ? 'उदा. प्रीमियम शरबती गेहूं (थोक)' : 'e.g. Premium Sharbati Wheat (Bulk)'}
                  value={wholesaleForm.name}
                  onChange={e => setWholesaleForm({ ...wholesaleForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'श्रेणी (Category):' : 'Category:'}</label>
                <select
                  value={wholesaleForm.category}
                  onChange={e => setWholesaleForm({ ...wholesaleForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e65100' }}>
                    {lang === 'hi' ? 'थोक मूल्य (₹ प्रति यूनिट):' : 'Wholesale Price (₹/unit):'}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45"
                    value={wholesaleForm.wholesalePrice}
                    onChange={e => setWholesaleForm({ ...wholesaleForm, wholesalePrice: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #FF6F00' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e65100' }}>
                    {lang === 'hi' ? 'न्यूनतम थोक मात्रा (MOQ):' : 'Min Wholesale Qty (MOQ):'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 50"
                    value={wholesaleForm.minimumWholesaleQuantity}
                    onChange={e => setWholesaleForm({ ...wholesaleForm, minimumWholesaleQuantity: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #FF6F00' }}
                  />
                  <small style={{ color: '#777', fontSize: '0.75rem' }}>
                    {lang === 'hi' ? 'थोक खरीद हेतु न्यूनतम अनिवार्य संख्या' : 'Minimum units a buyer must order'}
                  </small>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {lang === 'hi' ? 'उपलब्ध थोक स्टॉक:' : 'Total Wholesale Stock:'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={wholesaleForm.stock}
                    onChange={e => setWholesaleForm({ ...wholesaleForm, stock: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {lang === 'hi' ? 'इकाई प्रकार (Unit Type):' : 'Unit Type:'}
                  </label>
                  <select
                    value={wholesaleForm.wholesaleUnit}
                    onChange={e => setWholesaleForm({ ...wholesaleForm, wholesaleUnit: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="bags">Bags / बोरी</option>
                    <option value="quintals">Quintals / क्विंटल</option>
                    <option value="crates">Crates / कैरेट</option>
                    <option value="boxes">Boxes / पेटियां</option>
                    <option value="units">Pieces / Units</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {lang === 'hi' ? 'पैकेजिंग विवरण या लॉट साइज़:' : 'Wholesale Packaging / Lot Size:'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'उदा. 50 किग्रा की बोरी या 25 का बंडल' : 'e.g. 50kg jute sack or bundle of 25 crates'}
                  value={wholesaleForm.packagingDetails}
                  onChange={e => setWholesaleForm({ ...wholesaleForm, packagingDetails: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {lang === 'hi' ? 'थोक छूट या व्यापार की शर्तें (Tiered Terms):' : 'Tiered Discounts & Wholesale Terms:'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'उदा. 200 यूनिट से ऊपर 5% अतिरिक्त छूट, फार्म से सीधा उठाव' : 'e.g. Extra 5% off for 200+ units, direct farm pickup'}
                  value={wholesaleForm.wholesaleTerms}
                  onChange={e => setWholesaleForm({ ...wholesaleForm, wholesaleTerms: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {lang === 'hi' ? 'विवरण (Description):' : 'Description:'}
                </label>
                <textarea
                  rows={2}
                  placeholder={lang === 'hi' ? 'थोक उत्पाद की गुणवत्ता, ग्रेड आदि का विवरण दें' : 'Describe bulk quality, grade, delivery terms...'}
                  value={wholesaleForm.description}
                  onChange={e => setWholesaleForm({ ...wholesaleForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />
              </div>

              <button
                type="submit"
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #FF6F00, #e65100)',
                  color: '#fff',
                  padding: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                📦 {lang === 'hi' ? 'थोक उत्पाद प्रकाशित करें' : 'Publish Wholesale Product'}
              </button>
            </form>
          </div>

          {/* Wholesale Products List */}
          <div>
            <h3 style={{ margin: '0 0 16px', color: '#e65100' }}>
              📦 {lang === 'hi' ? 'मेरे थोक उत्पाद' : 'My Wholesale Products'} ({myProducts.filter(p => p.purchaseType === 'WHOLESALE' || p.purchaseType === 'BOTH').length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myProducts.filter(p => p.purchaseType === 'WHOLESALE' || p.purchaseType === 'BOTH').length === 0 ? (
                <div className="card" style={{ padding: '24px', textAlign: 'center', color: '#777' }}>
                  {lang === 'hi' ? 'अभी तक कोई थोक उत्पाद नहीं जोड़ा गया।' : 'No wholesale products listed yet. Use the form above to add bulk stock!'}
                </div>
              ) : (
                myProducts.filter(p => p.purchaseType === 'WHOLESALE' || p.purchaseType === 'BOTH').map(p => (
                  <div
                    key={p._id}
                    className="card"
                    style={{
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      borderLeft: '4px solid #FF6F00'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ margin: 0 }}>📦 {p.name}</h4>
                        <span className="badge" style={{ background: '#fff3e0', color: '#e65100' }}>
                          Wholesale
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#333', marginBottom: '4px' }}>
                        <strong>₹{p.wholesalePrice || p.price}</strong> / {p.wholesaleUnit || 'unit'} •{' '}
                        <span style={{ color: '#e65100', fontWeight: 600 }}>
                          MOQ: {p.minimumWholesaleQuantity} {p.wholesaleUnit || 'units'}
                        </span>{' '}
                        • Stock: {p.stock}
                      </div>
                      {p.packagingDetails && (
                        <div style={{ fontSize: '0.82rem', color: '#555', marginTop: '2px' }}>
                          📦 <em>{p.packagingDetails}</em>
                        </div>
                      )}
                      {p.wholesaleTerms && (
                        <div style={{ fontSize: '0.82rem', color: '#2E7D32', marginTop: '2px', fontWeight: 600 }}>
                          🏷️ {p.wholesaleTerms}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(p._id)}
                      style={{ border: 'none', background: 'transparent', color: '#c62828', cursor: 'pointer', fontSize: '1.1rem' }}
                      title="Delete Product"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: JOBS */}
      {activeTab === 'jobs' && (
        <div className="responsive-product-detail">
          {/* Post Job Form */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#2E7D32' }}>➕ {lang === 'hi' ? 'नई नौकरी पोस्ट करें' : 'Post New Job'}</h3>
            <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'पद का नाम (Job Title):' : 'Job Title:'}</label>
                <input type="text" required placeholder="Tractor Driver, Store Assistant..." value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'कार्य विवरण (Description):' : 'Description:'}</label>
                <textarea rows={3} required placeholder="Describe responsibilities and requirements..." value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              {/* AI Job Classification Trigger */}
              <button
                type="button"
                onClick={handleClassifyJob}
                disabled={classifying}
                style={{
                  background: 'linear-gradient(135deg, #FF6F00, #e65100)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🤖</span>
                <span>{classifying ? (lang === 'hi' ? 'एआई विश्लेषण कर रहा है...' : 'AI Analyzing...') : (lang === 'hi' ? 'एआई जॉब वर्गीकरण चलाएं (AI Classify)' : 'Classify Job with AI')}</span>
              </button>

              {/* AI Classification Result Badge */}
              {aiClassification && (
                <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', padding: '12px', borderRadius: '6px', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 'bold', color: '#2E7D32', marginBottom: '4px' }}>
                    ✓ AI Classification Result (Confidence: {(aiClassification.confidenceScore * 100).toFixed(0)}%):
                  </div>
                  <div>🏢 <strong>Industry:</strong> {aiClassification.industry}</div>
                  <div>⚙️ <strong>Work Nature:</strong> {aiClassification.workNature}</div>
                  <div>💡 <strong>Summary:</strong> {lang === 'hi' ? aiClassification.summaryHindi : aiClassification.summaryEnglish}</div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'न्यूनतम वेतन (₹):' : 'Min Salary (₹):'}</label>
                  <input type="number" value={jobForm.minSalary} onChange={e => setJobForm({ ...jobForm, minSalary: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'अधिकतम वेतन (₹):' : 'Max Salary (₹):'}</label>
                  <input type="number" value={jobForm.maxSalary} onChange={e => setJobForm({ ...jobForm, maxSalary: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'कौशल (Skills - कॉमा से अलग करें):' : 'Skills (comma separated):'}</label>
                <input type="text" value={jobForm.skills} onChange={e => setJobForm({ ...jobForm, skills: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>
                💼 {lang === 'hi' ? 'नौकरी प्रकाशित करें' : 'Publish Job'}
              </button>
            </form>
          </div>

          {/* List of Jobs */}
          <div>
            <h3 style={{ margin: '0 0 16px' }}>📋 {lang === 'hi' ? 'मेरी पोस्ट की गई नौकरियां' : 'My Posted Jobs'} ({myJobs.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myJobs.map(j => (
                <div key={j._id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 4px' }}>{j.title}</h4>
                    <span className="badge" style={{ background: '#e3f2fd', color: '#1565c0' }}>{j.jobType}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0' }}>
                    Salary: ₹{j.salary?.min} - ₹{j.salary?.max} • Applications: {j.applicationCount || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div>
          <h3 style={{ margin: '0 0 16px' }}>🛍️ {lang === 'hi' ? 'आने वाले ग्राहक ऑर्डर' : 'Incoming Customer Orders'} ({sellerOrders.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sellerOrders.map(order => (
              <div key={order._id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px' }}>Order #{order._id.slice(-6).toUpperCase()}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      👤 Buyer: {order.user?.name} ({order.user?.email}) • 📅 {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge" style={{ background: '#e8f5e9', color: '#2E7D32', fontSize: '0.9rem' }}>
                      Status: {order.orderStatus}
                    </span>
                    {/* Status updater */}
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                      style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.85rem' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                      <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#fafafa', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '10px' }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>🌾 {item.name} × {item.quantity} ({item.purchaseType})</span>
                      <strong>₹{item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                <div style={{ fontWeight: 800, textAlign: 'right', color: '#2E7D32', fontSize: '1.1rem' }}>
                  Total: ₹{order.total}
                </div>
              </div>
            ))}
            {sellerOrders.length === 0 && (
              <p style={{ color: '#777' }}>No incoming customer orders yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BUSINESS PROFILE */}
      {activeTab === 'business' && (
        <div className="card" style={{ padding: '28px', maxWidth: '650px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#2E7D32' }}>⚙️ {lang === 'hi' ? 'दुकान का विवरण और स्थान' : 'Business Details & Location'}</h3>
          <form onSubmit={handleSaveBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'दुकान का नाम:' : 'Business Name:'}</label>
              <input type="text" required value={bizForm.businessName} onChange={e => setBizForm({ ...bizForm, businessName: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'व्यापार श्रेणी:' : 'Category:'}</label>
              <input type="text" value={bizForm.category} onChange={e => setBizForm({ ...bizForm, category: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'फ़ोन नंबर:' : 'Phone:'}</label>
              <input type="text" value={bizForm.phone} onChange={e => setBizForm({ ...bizForm, phone: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'गाँव / सड़क:' : 'Street / Village:'}</label>
                <input type="text" value={bizForm.street} onChange={e => setBizForm({ ...bizForm, street: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'शहर / कस्बा:' : 'City:'}</label>
                <input type="text" value={bizForm.city} onChange={e => setBizForm({ ...bizForm, city: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'देशांतर (Longitude):' : 'Longitude (e.g. 79.02):'}</label>
                <input type="number" step="any" value={bizForm.lng} onChange={e => setBizForm({ ...bizForm, lng: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>{lang === 'hi' ? 'अक्षांश (Latitude):' : 'Latitude (e.g. 28.80):'}</label>
                <input type="number" step="any" value={bizForm.lat} onChange={e => setBizForm({ ...bizForm, lat: e.target.value })} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
            </div>

            {/* Delivery Radius Setting */}
            <div style={{ background: '#f9f9f9', padding: '14px', borderRadius: '8px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2E7D32' }}>
                  🚚 {lang === 'hi' ? 'डिलीवरी दायरा (Delivery Radius):' : 'Delivery Radius:'}
                </label>
                <strong style={{ fontSize: '1.05rem', color: '#FF6F00' }}>
                  {bizForm.deliveryRadiusKm || 10} km
                </strong>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={bizForm.deliveryRadiusKm || 10}
                onChange={(e) => setBizForm({ ...bizForm, deliveryRadiusKm: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#FF6F00' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                {lang === 'hi'
                  ? `आपकी दुकान से ${bizForm.deliveryRadiusKm || 10} किमी तक के ग्राहकों को डिलीवरी उपलब्ध दिखाई देगी।`
                  : `Customers within ${bizForm.deliveryRadiusKm || 10} km of your shop will see delivery available.`}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '10px', marginTop: '6px' }}>
              💾 {lang === 'hi' ? 'दुकान प्रोफ़ाइल सहेजें' : 'Save Business Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default RetailerDashboard;
