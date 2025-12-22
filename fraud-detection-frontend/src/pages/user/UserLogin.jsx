import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Wallet, ArrowRight, User, Lock } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserLogin = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axiosClient.post('/auth/user/login', credentials);
            
            // Lưu thông tin User vào localStorage
            localStorage.setItem('currentUser', JSON.stringify(res.data));
            
            toast.success(`Xin chào, ${res.data.fullName}!`);
            setTimeout(() => navigate('/user/transfer'), 1000); // Chuyển sang trang chuyển tiền

        } catch (error) {
            toast.error(error.response?.data || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
            <ToastContainer autoClose={1500} />
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                            <Wallet size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">E-Banking Login</h2>
                        <p className="text-gray-500 text-sm">Đăng nhập để thực hiện giao dịch</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Tài khoản</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18}/>
                                <input 
                                    type="text" 
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="user1"
                                    onChange={e => setCredentials({...credentials, username: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                                <input 
                                    type="password" 
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="••••••"
                                    onChange={e => setCredentials({...credentials, password: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Đang xử lý...' : <>Đăng nhập <ArrowRight size={18}/></>}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
                    Hệ thống demo bảo mật FraudGuard
                </div>
            </div>
        </div>
    );
};

export default UserLogin;