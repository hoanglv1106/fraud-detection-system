// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ShieldCheck, Lock, User } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Gọi API Backend
            const res = await axiosClient.post('/auth/login', credentials);
            
            // 2. Nếu thành công -> Lưu thông tin vào localStorage
            const adminInfo = res.data; // { id, username, fullName... }
            localStorage.setItem('admin', JSON.stringify(adminInfo));

            toast.success(`Xin chào, ${adminInfo.fullName}!`);
            
            // 3. Chuyển hướng vào Dashboard sau 1s
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data || "Đăng nhập thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <ToastContainer position="top-right" autoClose={2000} />
            
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4 text-blue-600">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-1">Đăng nhập để quản trị hệ thống FraudGuard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                name="username"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="admin"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                name="password"
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-bold text-white transition-all
                            ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30'}
                        `}
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;