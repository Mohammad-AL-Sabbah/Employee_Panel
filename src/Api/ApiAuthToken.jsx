import axios from 'axios';

const baseURL = 'https://psrs-palestine.runasp.net/api';

const ApiAuthToken = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// متغيرات التحكم في الطابور
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

// 1. مراقب الطلبات الصادرة
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

// 2. مراقب الردود الواردة (التصحيح النهائي)
ApiAuthToken.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // منع الدخول في حلقة مفرغة
    if (!originalRequest || originalRequest.url?.includes('/refresh-token') || originalRequest.url?.includes('/login')) {
      return Promise.reject(error);
    }

    // إذا انتهت الصلاحية ولم يتم المحاولة مسبقاً
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

      // ✅ الحل: تنفيذ التجديد داخل Promise نظيف بدون async executor
      return new Promise((resolve, reject) => {
        // نستخدم axios الأساسي لطلب التجديد لتجنب الـ interceptors
        axios.post(`${baseURL}/Auth/Account/refresh-token`, {}, {
          withCredentials: true,
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
        })
        .then(({ data }) => {
          if (data.success && data.accessToken) {
            sessionStorage.setItem('accessToken', data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            processQueue(null, data.accessToken);
            resolve(ApiAuthToken(originalRequest));
          } else {
            throw new Error('Refresh failed');
          }
        })
        .catch((refreshError) => {
          processQueue(refreshError, null);
          sessionStorage.clear();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          reject(refreshError);
        })
        .finally(() => {
          isRefreshing = false;
        });
      });
    }

    return Promise.reject(error);
  }
);

export default ApiAuthToken;