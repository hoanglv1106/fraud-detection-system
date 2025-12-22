// src/pages/user/HistoryPage.jsx
import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Search, Calendar, CheckCircle, XCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

const HistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(1); // Mặc định xem của User 1

    // Hàm gọi API lấy lịch sử
    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/transactions/user/${userId}`);
            // Sắp xếp: Giao dịch mới nhất lên đầu
            const sortedData = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setTransactions(sortedData);
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // Tự động tải khi mở trang hoặc đổi userId
    useEffect(() => {
        fetchHistory();
    }, [userId]);

    // Hàm helper để chọn màu cho trạng thái
    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle, text: 'Thành công' };
            case 'REJECTED_FRAUD': return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, text: 'Bị chặn' };
            case 'MANUAL_REVIEW': return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle, text: 'Đang duyệt' };
            default: return { color: 'text-gray-600', bg: 'bg-gray-100', icon: CheckCircle, text: status };
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Header + Bộ lọc */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={24} />
                    Lịch sử giao dịch
                </h2>

                {/* Ô nhập User ID để test */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300">
                    <Search size={16} className="text-gray-400"/>
                    <span className="text-sm text-gray-500">User ID:</span>
                    <input 
                        type="number" 
                        value={userId}
                        onChange={(e) => setUserId(Number(e.target.value))}
                        className="w-16 outline-none font-bold text-slate-700"
                    />
                </div>
            </div>

            {/* Danh sách giao dịch */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase font-semibold">
                        <tr>
                            <th className="p-4">Mã GD</th>
                            <th className="p-4">Thời gian</th>
                            <th className="p-4">Thiết bị</th>
                            <th className="p-4 text-right">Số tiền</th>
                            <th className="p-4 text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
                        {loading ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan="5" className="p-8 text-center text-gray-400">Chưa có giao dịch nào.</td></tr>
                        ) : (
                            transactions.map((tx) => {
                                const statusStyle = getStatusStyle(tx.status);
                                const StatusIcon = statusStyle.icon;
                                return (
                                    <tr key={tx.id} className="hover:bg-blue-50 transition-colors group">
                                        <td className="p-4 font-medium text-gray-500">#{tx.id}</td>
                                        <td className="p-4">
                                            <div className="font-medium text-slate-800">
                                                {new Date(tx.timestamp).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(tx.timestamp).toLocaleTimeString('vi-VN')}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                {tx.device} <span className="text-gray-300">|</span> {tx.location}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-bold text-slate-800">
                                            <div className="flex items-center justify-end gap-1">
                                                {tx.amount.toLocaleString('vi-VN')} đ
                                                <ArrowUpRight size={14} className="text-gray-400" />
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className={`flex items-center justify-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.color} border-transparent bg-opacity-50`}>
                                                <StatusIcon size={14} />
                                                {statusStyle.text}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryPage;