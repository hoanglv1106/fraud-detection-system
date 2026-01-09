import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Smartphone, MapPin, Send, CreditCard, LogOut } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';        
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();
    
    // Lấy thông tin User đã đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Nếu chưa đăng nhập -> Đá về Login
    useEffect(() => {
        if (!currentUser) {
            navigate('/user/login');
        }
    }, [currentUser, navigate]);

    // Khởi tạo form
    const [formData, setFormData] = useState({
        userId: currentUser?.id || '', 
        amount: '',
        device: 'iPhone',
        location: 'Ha Noi'
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/transactions', formData);
            
            // --- THÔNG BÁO THÀNH CÔNG ---
            toast.success(`Giao dịch ${parseInt(formData.amount).toLocaleString('vi-VN')}đ thành công!`, {
                position: "top-center",
                autoClose: 3000
            });
            
            setFormData({ ...formData, amount: '' }); // Reset tiền

        } catch (error) {
            // Xử lý lỗi từ Backend trả về
            if (error.response && error.response.data) {
                 const tx = error.response.data;
                 
                 // Trường hợp 1: Chờ duyệt (Manual Review)
                 if(tx.status === 'MANUAL_REVIEW') {
                     toast.warning("Giao dịch giá trị lớn đang chờ nhân viên duyệt!", {
                         position: "top-center",
                         autoClose: 5000
                     });
                 } 
                 // Trường hợp 2: Bị chặn (Fraud)
                 else if(tx.status === 'REJECTED_FRAUD') {
                     toast.error("Giao dịch bị CHẶN do nghi ngờ gian lận!", {
                         position: "top-center",
                         autoClose: 5000
                     });
                 } 
                 // Trường hợp khác (Lỗi server, lỗi logic...)
                 else {
                     toast.error(`Lỗi: ${typeof error.response.data === 'string' ? error.response.data : 'Giao dịch thất bại'}`);
                 }
            } else {
                toast.error(" Mất kết nối tới máy chủ!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if(window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.removeItem('currentUser');
            navigate('/user/login');
        }
    };

    if (!currentUser) return null;

    return (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-10 border border-gray-100 relative">
            
            {/* ĐẶT TOAST CONTAINER Ở ĐÂY ĐỂ HIỂN THỊ THÔNG BÁO */}
            <ToastContainer /> 

            {/* Header */}
            <div className="bg-blue-600 p-6 text-white flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold">Chuyển tiền nhanh</h2>
                    <p className="text-blue-100 text-sm mt-1">Xin chào, {currentUser.name}</p>
                    <p className="text-blue-200 text-xs">ID: #{currentUser.id}</p>
                </div>
                <button onClick={handleLogout} className="text-blue-100 hover:text-white bg-blue-700/50 p-2 rounded-lg transition-colors" title="Đăng xuất">
                    <LogOut size={18}/>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <input type="hidden" value={formData.userId} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                        <input
                            type="number"
                            required
                            min="10000"
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
                            placeholder="Ví dụ: 5000000"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        />
                    </div>
                    {/* Hiển thị số tiền bằng chữ */}
                    {formData.amount && (
                        <p className="text-xs text-blue-600 mt-1 font-medium text-right">
                            {parseInt(formData.amount).toLocaleString('vi-VN')} VNĐ
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị</label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                                value={formData.device}
                                onChange={(e) => setFormData({...formData, device: e.target.value})}
                            >
                                <option value="iPhone">iPhone</option>
                                <option value="Samsung">Samsung</option>
                                <option value="Web Browser">Web Browser</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vị trí</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                            <select
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none bg-white appearance-none cursor-pointer hover:border-blue-400 transition-colors"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                            >
                                <option value="Ha Noi">Hà Nội</option>
                                <option value="Ho Chi Minh">TP. HCM</option>
                                <option value="Da Nang">Đà Nẵng</option>
                                <option value="Unknown">Không xác định</option>
                                <option value="Nuoc Ngoai">Nước ngoài</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`
                        w-full font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-white
                        ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:-translate-y-1'}
                    `}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                            Đang xử lý...
                        </>
                    ) : (
                        <><Send size={18} /> Xác nhận chuyển tiền</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default HomePage;
