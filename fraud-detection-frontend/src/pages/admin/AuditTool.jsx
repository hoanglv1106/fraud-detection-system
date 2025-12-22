import { useState, useRef } from 'react';
import axiosClient from '../../api/axiosClient';
import { FileSpreadsheet, UploadCloud, Download, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-toastify';

const AuditTool = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    // Xử lý khi chọn file
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    // Xử lý kéo thả file
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    // Gửi file lên Backend và tự động tải báo cáo về
    const handleUpload = async () => {
        if (!file) {
            toast.warning("Vui lòng chọn file CSV trước!");
            return;
        }

        // Kiểm tra đuôi file sơ bộ
        if (!file.name.endsWith('.csv')) {
            toast.error("Chỉ chấp nhận file định dạng .csv");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Gọi API với cấu hình nhận file Binary (Blob)
            const response = await axiosClient.post('/admin/audit/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob', // <--- QUAN TRỌNG: Để nhận file Excel về
            });

            // Tạo link ảo để trình duyệt tự tải file về
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // Đặt tên file tải về (Lấy từ Header hoặc tự đặt)
            link.setAttribute('download', `Fraud_Report_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            
            // Dọn dẹp
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success("✅ Đã quét xong! Báo cáo đang được tải xuống.");
            setFile(null); // Reset form

        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Lỗi xử lý file: " + (error.message || "Server Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
                    <FileSpreadsheet className="text-green-600" size={32} />
                    Công cụ Kiểm toán (Audit Tool)
                </h1>
                <p className="text-slate-500">
                    Tải lên file lịch sử giao dịch (CSV) để hệ thống quét lại và phát hiện các giao dịch gian lận bị bỏ sót.
                </p>
            </div>

            {/* Upload Area */}
            <div 
                className={`
                    relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer bg-white
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
                
                {file ? (
                    // Giao diện khi đã chọn file
                    <div className="space-y-4 animate-scale-in">
                        <div className="bg-blue-100 p-4 rounded-full inline-block text-blue-600">
                            <FileText size={40} />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-slate-800">{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 p-2"
                            title="Hủy chọn"
                        >
                            <X size={20} />
                        </button>
                    </div>
                ) : (
                    // Giao diện chưa chọn file
                    <div className="space-y-4 pointer-events-none">
                        <div className="bg-gray-100 p-4 rounded-full inline-block text-gray-400">
                            <UploadCloud size={40} />
                        </div>
                        <div>
                            <p className="font-bold text-lg text-slate-700">Kéo thả file CSV vào đây</p>
                            <p className="text-sm text-gray-400">hoặc bấm để chọn file từ máy tính</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">Hỗ trợ: .csv (Max 10MB)</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`
                        flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform
                        ${!file || loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 hover:-translate-y-1 hover:shadow-green-500/30'}
                    `}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                            Đang xử lý AI...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={20} />
                            Bắt đầu Quét & Xuất Báo Cáo
                        </>
                    )}
                </button>
            </div>

            {/* Hướng dẫn nhanh */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4 items-start">
                <AlertTriangle className="text-blue-500 shrink-0" size={24} />
                <div className="text-sm text-blue-800 space-y-1">
                    <p className="font-bold">Lưu ý định dạng file CSV:</p>
                    <p>File cần có các cột theo thứ tự: <code>TransactionID, UserID, Amount, Timestamp, Location, Device</code></p>
                    <p className="italic opacity-80">Ví dụ: 1001, 1, 5000000, 2025-12-18T10:00:00, HaNoi, iPhone</p>
                </div>
            </div>
        </div>
    );
};

export default AuditTool;