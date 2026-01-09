import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
    Ban, Plus, Trash2, Edit2, X, ShieldAlert, CheckCircle, User, Globe, Smartphone 
} from 'lucide-react';
import { toast } from 'react-toastify';

const BlacklistPage = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // State cho Modal Thêm/Sửa
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ id: null, type: 'USER', value: '', reason: '' });
    const [isEdit, setIsEdit] = useState(false);

    // 1. Tải danh sách
    const fetchBlacklist = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/blacklist');
            // Sắp xếp mới nhất lên đầu
            setList(res.data.reverse());
        } catch (error) {
            toast.error("Lỗi tải danh sách đen!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlacklist();
    }, []);

    // 2. Xử lý mở Modal
    const openAddModal = () => {
        setFormData({ id: null, type: 'USER', value: '', reason: '' });
        setIsEdit(false);
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setFormData({ 
            id: item.id, 
            type: item.type, 
            value: item.value, 
            reason: item.reason 
        });
        setIsEdit(true);
        setShowModal(true);
    };

    // 3. Xử lý Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axiosClient.put(`/admin/blacklist/${formData.id}`, formData);
                toast.success("✅ Cập nhật thành công!");
            } else {
                await axiosClient.post('/admin/blacklist', formData);
                toast.success("⛔ Đã thêm vào danh sách đen!");
            }
            setShowModal(false);
            fetchBlacklist();
        } catch (error) {
            toast.error("Lỗi: " + (error.response?.data || "Thất bại"));
        }
    };

    // 4. Xử lý Xóa
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn gỡ bỏ đối tượng này khỏi danh sách đen?")) return;
        
        try {
            await axiosClient.delete(`/admin/blacklist/${id}`);
            toast.success("Đã xóa thành công!");
            fetchBlacklist();
        } catch (error) {
            toast.error("Xóa thất bại!");
        }
    };

    // Helper: Style cho Badge loại chặn
    const getTypeConfig = (type) => {
        switch(type) {
            case 'USER': return { 
                class: 'bg-purple-100 text-purple-700 border-purple-200', 
                icon: User 
            };
            case 'IP': return { 
                class: 'bg-blue-100 text-blue-700 border-blue-200', 
                icon: Globe 
            };
            default: return { 
                class: 'bg-orange-100 text-orange-700 border-orange-200', 
                icon: Smartphone 
            };
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Ban className="text-red-600" />
                        Quản lý Blacklist
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Danh sách các đối tượng bị chặn giao dịch (User ID, IP, Thiết bị).
                    </p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all"
                >
                    <Plus size={20} /> Thêm mới
                </button>
            </div>

            {/* Bảng Danh sách */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-bold tracking-wider">
                        <tr>
                            <th className="p-4 border-b w-20">ID</th>
                            <th className="p-4 border-b w-32">Loại chặn</th>
                            {/* Đổi tên cột này */}
                            <th className="p-4 border-b">Đối tượng bị chặn</th> 
                            <th className="p-4 border-b">Lý do</th>
                            <th className="p-4 border-b w-40">Ngày tạo</th>
                            <th className="p-4 border-b w-32 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-slate-700">
                        {loading ? (
                            <tr><td colSpan="6" className="p-8 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                        ) : list.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-10 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                        <CheckCircle size={40} className="text-green-500 mb-2"/>
                                        <p>Danh sách trống. Hệ thống an toàn!</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            list.map((item) => {
                                const typeConfig = getTypeConfig(item.type);
                                const TypeIcon = typeConfig.icon;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-mono text-gray-500">#{item.id}</td>
                                        
                                        {/* Cột Loại chặn */}
                                        <td className="p-4">
                                            <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded text-xs font-bold border ${typeConfig.class}`}>
                                                <TypeIcon size={12} />
                                                {item.type}
                                            </span>
                                        </td>

                                        {/* ---  HIỂN THỊ THÔNG TIN USER --- */}
                                        <td className="p-4">
                                            {item.type === 'USER' ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                        <User size={16}/>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm">
                                                            {item.userName || "Unknown User"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {item.userEmail || "No Email"}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                            ID: {item.value}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                        {item.type === 'IP' ? <Globe size={16}/> : <Smartphone size={16}/>}
                                                    </div>
                                                    <span className="font-bold text-slate-800 font-mono text-base">
                                                        {item.value}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        {/* ---------------------------------------------------- */}

                                        <td className="p-4 max-w-xs truncate text-red-600 font-medium" title={item.reason}>
                                            {item.reason}
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs">
                                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                                                    title="Sửa lý do"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                                                    title="Gỡ bỏ"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-lg font-bold text-slate-800">
                                {isEdit ? 'Cập nhật thông tin chặn' : 'Thêm vào danh sách đen'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại đối tượng</label>
                                <select 
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    disabled={isEdit} // Không cho sửa loại khi đang edit
                                >
                                    <option value="USER">User ID (Người dùng)</option>
                                    <option value="IP">Địa chỉ IP</option>
                                    <option value="DEVICE">Device ID (Thiết bị)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị (ID/IP)</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none disabled:bg-gray-100"
                                    placeholder={formData.type === 'USER' ? "Nhập User ID (VD: 1)" : "VD: 192.168.1.1"}
                                    value={formData.value}
                                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                                    disabled={isEdit} // Không cho sửa giá trị khi đang edit (chỉ sửa lý do)
                                />
                                {!isEdit && <p className="text-xs text-gray-500 mt-1">Nhập chính xác ID User có trong hệ thống.</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chặn</label>
                                <textarea 
                                    required
                                    rows="3"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="VD: Nghi vấn rửa tiền, Spam nhiều lần..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                ></textarea>
                            </div>

                            <div className="pt-2">
                                <button 
                                    type="submit"
                                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                                >
                                    <ShieldAlert size={20} />
                                    {isEdit ? 'Lưu thay đổi' : 'Xác nhận Chặn'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlacklistPage;
