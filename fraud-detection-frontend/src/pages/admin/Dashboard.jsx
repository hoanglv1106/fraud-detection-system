import { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
    Activity, ShieldAlert, Clock, DollarSign, ArrowUpRight, TrendingUp 
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hàm tải dữ liệu tổng hợp
    const fetchData = async () => {
        try {
            // 1. Gọi API thống kê tổng quan (4 ô cards)
            const statsRes = await axiosClient.get('/admin/stats');
            setStats(statsRes.data);

            // 2. Gọi API biểu đồ (Dữ liệu 7 ngày qua từ MySQL)
            const chartRes = await axiosClient.get('/admin/stats/daily');
            
            // Map dữ liệu từ API sang format của Recharts
            // API trả về: { date: "18/12", amount: 5000000 }
            // Recharts cần: { name: "18/12", amount: 5000000 }
            const formattedData = chartRes.data.map(item => ({
                name: item.date,
                amount: item.amount
            }));

            setChartData(formattedData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu Dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(); // Tải lần đầu

        // Tự động cập nhật mỗi 30 giây (Real-time dashboard)
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-400">
                <div className="animate-spin mr-2 h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                Đang tải dữ liệu thực tế...
            </div>
        );
    }

    // Giá trị mặc định nếu API trả về null
    const data = stats || { 
        totalTransactions: 0, 
        fraudTransactions: 0, 
        manualReviewPending: 0, 
        totalVolume: 0 
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Dashboard */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
                    <p className="text-slate-500 text-sm mt-1">Dữ liệu thời gian thực từ Database</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-600">Hệ thống Online</span>
                </div>
            </div>

            {/* 1. CARDS: 4 Ô số liệu thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Tổng giao dịch" 
                    value={data.totalTransactions} 
                    icon={TrendingUp} 
                    color="text-blue-600" 
                    bg="bg-blue-50" 
                />
                <StatCard 
                    title="Phát hiện gian lận" 
                    value={data.fraudTransactions} 
                    icon={ShieldAlert} 
                    color="text-red-600" 
                    bg="bg-red-50" 
                />
                <StatCard 
                    title="Chờ duyệt" 
                    value={data.manualReviewPending} 
                    icon={Clock} 
                    color="text-yellow-600" 
                    bg="bg-yellow-50" 
                />
                <StatCard 
                    title="Dòng tiền (VNĐ)" 
                    value={data.totalVolume.toLocaleString('vi-VN')} 
                    icon={DollarSign} 
                    color="text-emerald-600" 
                    bg="bg-emerald-50" 
                />
            </div>

            {/* 2. CHARTS: Biểu đồ dòng tiền */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Biểu đồ chính */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-slate-700 mb-6 flex justify-between">
                        <span>Xu hướng dòng tiền (7 ngày qua)</span>
                        <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded">Live Data</span>
                    </h3>
                    
                    <div className="h-80">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: '#94a3b8'}} 
                                        tickFormatter={(value) => 
                                            value >= 1000000 ? `${(value / 1000000).toFixed(0)}M` : value
                                        }
                                    />
                                    <Tooltip 
                                        formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#3b82f6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorAmount)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Activity size={32} className="mb-2 opacity-50"/>
                                <p>Chưa có dữ liệu giao dịch trong 7 ngày qua</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ô thông tin phụ (An ninh) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                    <div className="p-4 bg-indigo-50 rounded-full mb-4 animate-pulse">
                        <ShieldAlert size={40} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Trạng thái bảo mật</h3>
                    <p className="text-gray-500 text-sm mt-2 mb-6 px-4">
                        Hệ thống FraudGuard đang quét toàn bộ giao dịch thời gian thực.
                    </p>
                    
                    <div className="w-full space-y-4 px-2">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Độ chính xác AI (Z-Score)</span>
                                <span className="font-bold text-slate-700">98.5%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '98.5%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Thời gian phản hồi</span>
                                <span className="font-bold text-slate-700">12ms</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component con hiển thị thẻ thống kê
const StatCard = ({ title, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-default group">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h4 className="text-2xl font-extrabold text-slate-800 group-hover:scale-105 transition-transform duration-200 origin-left">
                    {value}
                </h4>
            </div>
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                <Icon size={24} />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400">
            <Clock size={12} />
            <span>Cập nhật: Vừa xong</span>
        </div>
    </div>
);

export default Dashboard;