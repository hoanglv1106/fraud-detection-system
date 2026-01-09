import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { 
    X, MapPin, Smartphone, Clock, ShieldAlert, User, Mail, Phone, 
    Activity, AlertTriangle, CheckCircle 
} from 'lucide-react';

const TransactionDetailModal = ({ transactionId, onClose }) => {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    // Gọi API lấy chi tiết
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await axiosClient.get(`/admin/transactions/${transactionId}`);
                setDetail(res.data);
            } catch (error) {
                console.error("Lỗi tải chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };

        if (transactionId) fetchDetail();
    }, [transactionId]);

    if (!transactionId) return null;

    // Helper chọn màu status
    const getStatusStyle = (status) => {
        if (status === 'APPROVED') return { text: 'Thành công', class: 'text-green-600 bg-green-100 border-green-200' };
        if (status === 'MANUAL_REVIEW') return { text: 'Chờ duyệt', class: 'text-yellow-600 bg-yellow-100 border-yellow-200' };
        return { text: 'Bị chặn', class: 'text-red-600 bg-red-100 border-red-200' };
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-scale-in">
                
                {/* 1. Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-slate-50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Hồ sơ giao dịch</h3>
                        <p className="text-sm text-gray-500 font-mono">Transaction ID: #{transactionId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm">
                        <X size={20} />
                    </button>
                </div>

                {loading || !detail ? (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mb-4"></div>
                        <p>Đang tải dữ liệu từ Server...</p>
                    </div>
                ) : (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                        
                        {/* 2. Cột Trái: Thông tin Giao dịch & User */}
                        <div className="space-y-6">
                            {/* Số tiền & Trạng thái */}
                            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-sm text-gray-500 mb-1">Giá trị giao dịch</p>
                                <div className="text-3xl font-extrabold text-slate-800 mb-3">
                                    {detail.amount.toLocaleString('vi-VN')} đ
                                </div>
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(detail.status).class}`}>
                                    {detail.status}
                                </span>
                            </div>

                            {/* Thông tin Khách hàng */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <User size={14} /> Thông tin khách hàng
                                </h4>
                                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Họ và tên</p>
                                            <p className="font-bold text-slate-700">{detail.userName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
                                            <Mail size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium text-slate-700">{detail.userEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                            <Phone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Số điện thoại</p>
                                            <p className="font-medium text-slate-700">{detail.userPhone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Cột Phải: Ngữ cảnh & Phân tích  */}
                        <div className="space-y-6">
                            {/* Ngữ cảnh (Thiết bị, Vị trí) */}
                            <div className="grid grid-cols-2 gap-3">
                                <InfoBox icon={Clock} label="Thời gian" value={new Date(detail.timestamp).toLocaleTimeString('vi-VN')} />
                                <InfoBox icon={MapPin} label="Vị trí" value={detail.location} />
                                <InfoBox icon={Smartphone} label="Thiết bị" value={detail.device} />
                                <InfoBox icon={Activity} label="IP" value="192.168.1.1" /> {/* IP giả lập */}
                            </div>

                            {/* ---  KẾT QUẢ  --- */}
                            <div className={`rounded-xl border-l-4 p-5 shadow-sm ${detail.isAnomaly ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                                <h4 className={`text-sm font-bold flex items-center gap-2 mb-4 ${detail.isAnomaly ? 'text-red-800' : 'text-green-800'}`}>
                                    {detail.isAnomaly ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                                    Kết quả phân tích AI
                                </h4>

                                <div className="space-y-4">
                                    {/* Điểm số */}
                                    <div className="flex justify-between gap-2">
                                        <div className="flex-1 bg-white p-2 rounded-lg border border-opacity-10 border-black text-center">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Z-Score</p>
                                            <p className="text-lg font-bold text-slate-800">
                                                {detail.zScore !== undefined && detail.zScore !== null ? detail.zScore.toFixed(2) : "N/A"}
                                            </p>
                                        </div>
                                        <div className="flex-1 bg-white p-2 rounded-lg border border-opacity-10 border-black text-center">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">Fraud Score</p>
                                            <p className={`text-lg font-bold ${detail.fraudScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                                                {detail.fraudScore !== undefined && detail.fraudScore !== null ? detail.fraudScore : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lý do cảnh báo */}
                                    <div className="bg-white p-3 rounded-lg border border-opacity-10 border-black">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Nguyên nhân / Đánh giá</p>
                                        <p className="text-sm font-medium text-slate-800">
                                            {detail.aiReason ? detail.aiReason : (detail.isAnomaly ? "Phát hiện bất thường từ dữ liệu lịch sử" : "Giao dịch an toàn")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-lg transition">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

// Component con hiển thị hộp thông tin nhỏ
const InfoBox = ({ icon: Icon, label, value }) => (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 mb-1 text-gray-400">
            <Icon size={14} />
            <span className="text-[10px] uppercase font-bold">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-700 truncate" title={value}>{value}</p>
    </div>
);

export default TransactionDetailModal;
