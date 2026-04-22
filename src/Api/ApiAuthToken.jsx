import axios from 'axios';

const baseURL = import.meta.env.VITE_BASE_URL;

const ApiAuthToken = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// مراقب الطلبات
ApiAuthToken.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// مراقب الردود
ApiAuthToken.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // تجنب التكرار لبعض المسارات
    if (originalRequest.url?.includes('/refresh-token') ||
        originalRequest.url?.includes('/login') ||
        originalRequest.url?.includes('/logout')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return ApiAuthToken(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${baseURL}/Auth/Account/refresh-token`, {}, {
          withCredentials: true
        });

        if (response.data.success && response.data.accessToken) {
          const { accessToken } = response.data;
          
          sessionStorage.setItem('accessToken', accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          
          return ApiAuthToken(originalRequest);
        } else {
          throw new Error('Refresh failed - no token');
        }
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        sessionStorage.removeItem('accessToken');
        processQueue(refreshError, null);
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
        
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default ApiAuthToken;