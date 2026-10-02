import axios from 'axios';

let currentAccessToken = localStorage.getItem('rc_access_token') || null;

export const setAccessToken = (token) => {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem('rc_access_token', token);
  } else {
    localStorage.removeItem('rc_access_token');
  }
};

export const getAccessToken = () => currentAccessToken;

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers['Authorization'] = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          'http://localhost:5000/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes.data?.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
