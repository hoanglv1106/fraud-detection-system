import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Bell, AlertTriangle, Clock, ArrowRight } from 'lucide-react'; // Bỏ các icon thừa
import { toast } from 'react-toastify';
import TransactionDetailModal from '../../components/TransactionDetailModal';

const AlertsPage = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State lưu giao dịch đang xem
    const [selectedTx, setSelectedTx] = useState(null); 

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/alerts');
            setAlerts(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải dữ liệu cảnh báo!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Bell className="text-red-500" />
                        Cảnh báo nóng
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Danh sách các giao dịch đáng ngờ phát hiện gần đây (Real-time)
                    </p>
                </div>
                <button onClick={fetchAlerts} className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Làm mới
                </button>
            </div>

            <div className="grid gap-4">
                {loading && alerts.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Đang tải dữ liệu...</div>
                ) : (
                    alerts.map((tx) => (
                        <div 
                            // SỬA 1: Key an toàn (lấy id hoặc transactionId)
                            key={tx.id || tx.transactionId} 
                            className="bg-white p-5 rounded-xl border-l-4 border-red-500 shadow-sm hover:shadow-md transition-all flex justify-between items-center cursor-pointer group"
                            
                            // SỬA 2: Log ra console để debug nếu cần
                            onClick={() => {
                                console.log("Click item:", tx); 
                                setSelectedTx(tx);
                            }} 
                        >
                            <div className="flex items-start gap-4">
                                <div className="bg-red-100 p-3 rounded-full text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-slate-800 text-lg">
                                            {tx.amount?.toLocaleString('vi-VN')} đ
                                        </span>
                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold border border-red-200">
                                            {tx.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        User: <span className="font-semibold">#{tx.user?.id || tx.userId}</span> 
                                        <span className="mx-2">•</span>
                                        {tx.location} - {tx.device}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        {tx.timestamp ? new Date(tx.timestamp).toLocaleString('vi-VN') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    setSelectedTx(tx); 
                                }}
                                className="text-blue-600 bg-blue-50 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* --- KHU VỰC SỬA LỖI CHÍNH --- */}
            {selectedTx && (
                <TransactionDetailModal 
                    // Lỗi cũ: transaction={selectedTx} -> Modal không hiểu
                    // SỬA THÀNH: transactionId={...} và xử lý cả 2 trường hợp tên ID
                    transactionId={selectedTx.id || selectedTx.transactionId} 
                    onClose={() => setSelectedTx(null)} 
                />
            )}
            {/* ----------------------------- */}
        </div>
    );
};

export default AlertsPage;