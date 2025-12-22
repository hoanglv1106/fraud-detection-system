import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Check, X, Eye, AlertCircle, User, Smartphone, MapPin, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const TransactionReview = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy thông tin Admin đang đăng nhập
    const adminUser = JSON.parse(localStorage.getItem('admin'));
    const adminUsername = adminUser ? adminUser.username : 'unknown_admin';

    // Hàm tải danh sách chờ duyệt
    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/transactions/pending');
            // Sắp xếp: Cũ nhất lên đầu (FIFO) để xử lý không bị tồn đọng
            const sorted = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            setTransactions(sorted);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải danh sách chờ duyệt!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    // Xử lý hành động Duyệt (Approve) hoặc Chặn (Reject)
    const handleReview = async (transactionId, isApproved) => {
        if (!window.confirm(isApproved 
            ? "Bạn chắc chắn muốn DUYỆT giao dịch này?" 
            : "Bạn chắc chắn xác nhận giao dịch này là GIAN LẬN?")) {
            return;
        }

        try {
            // Gọi API Backend
            await axiosClient.post(`/admin/transactions/${transactionId}/review`, null, {
                params: { 
                    approve: isApproved,
                    adminUsername: adminUsername 
                }
            });
            
            // Thông báo thành công
            if (isApproved) {
                toast.success(`✅ Đã phê duyệt giao dịch #${transactionId}`);
            } else {
                toast.error(`⛔ Đã chặn giao dịch #${transactionId} (Gian lận)`);
            }

            // Refresh lại danh sách (bỏ giao dịch vừa xử lý đi)
            fetchPending();

        } catch (error) {
            toast.error("Lỗi xử lý: " + (error.response?.data || error.message));
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải danh sách chờ...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="text-yellow-500" />
                        Duyệt giao dịch thủ công
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Các giao dịch bị AI đánh dấu là "Nghi ngờ" cần người quản lý kiểm tra.
                    </p>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold shadow-sm">
                    {transactions.length} Pending
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="p-5 border-b border-gray-200">Giao dịch</th>
                                <th className="p-5 border-b border-gray-200">Người dùng</th>
                                <th className="p-5 border-b border-gray-200 text-right">Số tiền</th>
                                <th className="p-5 border-b border-gray-200">Ngữ cảnh</th>
                                <th className="p-5 border-b border-gray-200 text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Check className="w-12 h-12 bg-green-100 text-green-500 p-2 rounded-full mb-3" />
                                            <p className="text-lg font-medium text-slate-600">Tuyệt vời! Không có đơn nào tồn đọng.</p>
                                            <p className="text-sm">Hệ thống đang hoạt động ổn định.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-blue-50/50 transition-colors group">
                                        <td className="p-5 align-top">
                                            <span className="font-bold text-slate-800">#{tx.id}</span>
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                <Calendar size={12} />
                                                {new Date(tx.timestamp).toLocaleString('vi-VN')}
                                            </div>
                                        </td>
                                        
                                        <td className="p-5 align-top">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="bg-gray-200 p-1.5 rounded-full"><User size={14}/></div>
                                                <span className="font-semibold text-blue-600">User {tx.user?.username}</span>
                                            </div>
                                             
                                            <div className="text-xs text-gray-500 ml-8">
                                                 <span >MKH: {tx.user?.id}</span>
                                            </div>
                                        </td>

                                        <td className="p-5 align-top text-right">
                                            <div className="font-bold text-slate-800 text-lg">
                                                {tx.amount.toLocaleString('vi-VN')} đ
                                            </div>
                                            <div className="text-xs text-red-500 font-medium bg-red-50 inline-block px-2 py-0.5 rounded mt-1 border border-red-100">
                                                High Risk
                                            </div>
                                        </td>

                                        <td className="p-5 align-top">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Smartphone size={14} className="text-gray-400"/>
                                                    {tx.device}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin size={14} className="text-gray-400"/>
                                                    {tx.location}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-5 align-middle">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => handleReview(tx.id, true)}
                                                    className="flex flex-col items-center gap-1 group/btn"
                                                    title="Duyệt (An toàn)"
                                                >
                                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover/btn:bg-green-600 group-hover/btn:text-white transition-all shadow-sm">
                                                        <Check size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-green-600 opacity-0 group-hover/btn:opacity-100 transition-opacity">Duyệt</span>
                                                </button>

                                                <button 
                                                    onClick={() => handleReview(tx.id, false)}
                                                    className="flex flex-col items-center gap-1 group/btn"
                                                    title="Chặn (Gian lận)"
                                                >
                                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover/btn:bg-red-600 group-hover/btn:text-white transition-all shadow-sm">
                                                        <X size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-red-600 opacity-0 group-hover/btn:opacity-100 transition-opacity">Chặn</span>
                                                </button>
                                                
                                                {/* Nút xem chi tiết (Mở rộng sau này) */}
                                               
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionReview;