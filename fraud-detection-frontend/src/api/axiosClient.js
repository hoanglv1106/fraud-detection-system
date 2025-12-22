// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Đường dẫn gốc API Backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Cấu hình interceptor (Tùy chọn: để debug lỗi nhanh hơn)
axiosClient.interceptors.response.use(
    (response) => {
        return response; // Trả về dữ liệu nếu thành công
    },
    (error) => {
        console.error("API Error:", error.response || error.message);
        return Promise.reject(error);
    }
);

export default axiosClient;