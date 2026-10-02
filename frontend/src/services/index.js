import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  registerRetailer: (data) => api.post('/auth/register-retailer', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const profileService = {
  getMyProfile: () => api.get('/profile/me'),
  updateMyProfile: (data) => api.put('/profile/me', data),
};

export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getMyProducts: () => api.get('/products/seller/my'),
  autocomplete: (q) => api.get(`/products/autocomplete?q=${encodeURIComponent(q)}`),
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
};

export const jobService = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: () => api.get('/jobs/retailer/my'),
  applyToJob: (id, data) => api.post(`/jobs/${id}/apply`, data),
  getJobApplications: (id) => api.get(`/jobs/${id}/applications`),
  getMyApplications: () => api.get('/applications/my'),
  updateApplicationStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
};

export const businessService = {
  getBusinesses: (params) => api.get('/businesses', { params }),
  getBusinessById: (id) => api.get(`/businesses/${id}`),
  createBusiness: (data) => api.post('/businesses', data),
  getMyBusiness: () => api.get('/businesses/my'),
  updateBusiness: (data) => api.put('/businesses/my', data),
  verifyBusiness: (id, status) => api.patch(`/businesses/${id}/verify`, { status }),
};

export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
};

export const orderService = {
  checkout: (data) => api.post('/orders/checkout', data),
  getMyOrders: () => api.get('/orders/my'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  getSellerOrders: () => api.get('/orders/seller'),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
};

export const aiService = {
  chat: (data) => api.post('/ai/chat', data),
  classifyJob: (data) => api.post('/ai/classify-job', data),
  getConversations: () => api.get('/ai/conversations'),
  getMessages: (conversationId) => api.get(`/ai/conversations/${conversationId}/messages`),
};

export const adminService = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getBusinesses: (params) => api.get('/admin/businesses', { params }),
  verifyBusiness: (id, status) => api.patch(`/admin/businesses/${id}/verify`, { status }),
  getAnalytics: () => api.get('/admin/analytics'),
  getOrders: () => api.get('/admin/orders'),
};
