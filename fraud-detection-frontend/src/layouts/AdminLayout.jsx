// src/layouts/AdminLayout.jsx

import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, FileSpreadsheet, LogOut,Bell,Ban } from 'lucide-react';
import { Users } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();
    const adminInfo = JSON.parse(localStorage.getItem('admin'));
    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/admin/login');
    };


    // Danh sách menu
    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/alerts', label: 'Warning', icon: Bell },
        { path: '/admin/review', label: 'Review Center', icon: ShieldAlert },
        { path: '/admin/users', label: ' User Managements', icon: Users },
        { path: '/admin/blacklist', label: 'Danh sách đen', icon: Ban },
        { path: '/admin/audit', label: 'Audit Tool', icon: FileSpreadsheet },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-slate-800">
            
            {/* 1. SIDEBAR (MENU TRÁI) */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-all">
                {/* Logo Area */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <ShieldAlert size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-wide">FraudGuard</h1>
                            <p className="text-xs text-slate-400">Admin Portal</p>
                        </div>
                    </div>
                </div>
                
                {/* Menu Links */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Sidebar */}
                <div className="p-4 border-t border-slate-800">
                    <div className="bg-slate-800 rounded-xl p-4 mb-4">
                        <p className="text-xs text-slate-400 mb-1">Đang đăng nhập:</p>
                          <p className="font-bold text-sm">
                                {adminInfo?.fullName || adminInfo?.username || 'Admin'}
                         </p>
                    </div>
                   <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 w-full py-2.5 rounded-lg transition-colors text-sm font-medium">
                   <LogOut size={18} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* 2. MAIN CONTENT (NỘI DUNG PHẢI) */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header nhỏ trên cùng */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-700 uppercase tracking-wide">
                        {/* Tự động hiện tên trang dựa trên URL */}
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Quản trị hệ thống'}
                    </h2>
                    <div className="flex items-center gap-4">
                         <span className="text-sm text-gray-500">v1.0.0</span>
                    </div>
                </header>

                {/* Khu vực nội dung thay đổi (Outlet) */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50 scroll-smooth">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;