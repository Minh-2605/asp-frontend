import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://asp-net-11.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR CHO REQUEST: Tự động đính kèm Token
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Kiểm tra chính xác tên trường Token mà Backend trả về (thường là token hoặc accessToken)
        const token = user.token || user.accessToken || user.jwt;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.error("Lỗi đọc dữ liệu từ LocalStorage", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR CHO RESPONSE: Xử lý dữ liệu và lỗi tập trung
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data để ở các file .jsx chủ nhân không cần gọi res.data nữa
    return response.data;
  },
  (error) => {
    // 1. Xử lý lỗi xác thực (401 hoặc 403)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Phiên đăng nhập hết hạn hoặc không có quyền.");
      localStorage.removeItem('user');
      // Chỉ chuyển hướng nếu không phải đang ở trang login để tránh lặp vô tận
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 2. Log lỗi chi tiết để chủ nhân dễ fix khi nhìn vào Console
    console.error("API Error:", error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

export default axiosClient;