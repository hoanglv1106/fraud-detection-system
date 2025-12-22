
import { Outlet, Link } from 'react-router-dom';
import { Wallet, History, LogOut } from 'lucide-react';

const UserLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* NAVBAR */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <Wallet size={24} />
                            </div>
                            <span className="font-bold text-xl text-slate-800">E-Banking</span>
                        </div>

                        {/* Menu */}
                        <div className="flex items-center gap-6">
                            <Link to="/user/transfer" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
                                <Wallet size={18} />
                                Chuyển tiền
                            </Link>
                            <Link to="/user/history" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
                                <History size={18} />
                                Lịch sử
                            </Link>
                            <button className="text-gray-400 hover:text-red-500">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <main className="max-w-4xl mx-auto mt-8 px-4 pb-12">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;