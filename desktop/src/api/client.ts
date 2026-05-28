import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'X-Client-Type': 'desktop' },
});

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401 or 403 (disabled account)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginUrl = error.config?.url?.includes('/api/auth/login');
    if ((status === 401 || status === 403) && !isLoginUrl) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/cashier-login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
