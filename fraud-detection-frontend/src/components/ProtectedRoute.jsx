// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Kiểm tra xem đã đăng nhập chưa (check localStorage)
    const admin = JSON.parse(localStorage.getItem('admin'));

    if (!admin) {
        // Chưa đăng nhập -> Đá về trang Login
        return <Navigate to="/admin/login" replace />;
    }

    // Đã đăng nhập -> Cho phép vào trang con (children)
    return children;
};

export default ProtectedRoute;