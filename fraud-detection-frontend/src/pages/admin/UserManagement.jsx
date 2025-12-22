import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
    Users, Search, ShieldAlert, Ban, Mail, Phone, Calendar 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // State cho Modal Ban
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [banReason, setBanReason] = useState('');

    const navigate = useNavigate();

    // 1. Tải danh sách User
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    // 2. Mở Modal Ban
    const handleOpenBan = (user) => {
        setSelectedUser(user);
        setBanReason('');
        setShowBanModal(true);
    };

    // 3. Thực hiện hành động ném vào Blacklist
    const handleConfirmBan = async () => {
        if (!banReason.trim()) {
            toast.warning("Vui lòng nhập lý do chặn!");
            return;
        }

        try {
            // Gọi API thêm vào Blacklist
            await axiosClient.post('/admin/blacklist', {
                type: 'USER',
                value: selectedUser.id.toString(), // Lấy ID chính xác từ User đã chọn
                reason: banReason
            });

            toast.success(`🚫 Đã chặn User: ${selectedUser.name}`);
            setShowBanModal(false);
            
            // Tùy chọn: Có thể điều hướng sang trang Blacklist để xem kết quả
            // navigate('/admin/blacklist'); 

        } catch (error) {
            toast.error(error.response?.data || "Lỗi khi chặn người dùng!");
        }
    };

    // Filter tìm kiếm
    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Quản lý Người dùng
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Danh sách khách hàng trong hệ thống.
                    </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên, email, ID..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4 border-b">User Info</th>
                            <th className="p-4 border-b">Liên hệ</th>
                            <th className="p-4 border-b">Ngày tham gia</th>
                            <th className="p-4 border-b text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
                        {loading ? (
                            <tr><td colSpan="4" className="p-8 text-center text-gray-400">Đang tải...</td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                            {user.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.name}</p>
                                            <p className="text-xs text-gray-500">ID: #{user.id} • @{user.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 space-y-1">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={14}/> {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone size={14}/> {user.phone || 'N/A'}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14}/>
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => handleOpenBan(user)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100 font-medium text-xs"
                                        title="Chặn người dùng này"
                                    >
                                        <Ban size={16} /> Chặn (Blacklist)
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODAL BAN --- */}
            {showBanModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="bg-red-50 p-5 border-b border-red-100 flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-full text-red-600">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-800">Xác nhận chặn User</h3>
                                <p className="text-sm text-red-600">Hành động này sẽ ngăn User giao dịch.</p>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase font-bold">Đối tượng bị chặn</p>
                                <p className="text-lg font-bold text-slate-800">{selectedUser.name}</p>
                                <p className="text-sm text-gray-600">User ID: <span className="font-mono font-bold">#{selectedUser.id}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chặn <span className="text-red-500">*</span></label>
                                <textarea 
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    rows="3"
                                    placeholder="Ví dụ: Phát hiện gian lận, tài khoản bị hack..."
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    autoFocus
                                ></textarea>
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowBanModal(false)}
                                    className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={handleConfirmBan}
                                    className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-500/30 transition"
                                >
                                    Xác nhận Chặn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;