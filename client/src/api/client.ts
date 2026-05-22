import axios from 'axios';

function getBaseURL(): string {
  const ip   = localStorage.getItem('server_ip')   ?? '127.0.0.1';
  const port = localStorage.getItem('server_port') ?? '3000';
  return `http://${ip}:${port}`;
}

const apiClient = axios.create({
  baseURL: getBaseURL(),
});

export function updateBaseURL(ip: string, port: string): void {
  apiClient.defaults.baseURL = `http://${ip}:${port}`;
}

// Attach JWT token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
