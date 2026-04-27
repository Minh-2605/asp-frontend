import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { BookOpen, User, Calendar, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const [borrows, setBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient.get('/Borrows')
      .then(res => setBorrows(Array.isArray(res) ? res : []))
      .catch(err => console.error("Lỗi Dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  // Tính toán nhanh các con số thống kê
  const totalBorrows = borrows.length;
  const activeBorrows = borrows.filter(b => b.status === 0).length;
  const returnedBorrows = borrows.filter(b => b.status !== 0).length;

  if (loading) return <div className="p-8 text-slate-500 animate-pulse">Đang tải dữ liệu tổng quan...</div>;

  return (
    <div className="space-y-8">
      {/* Tiêu đề */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <BarChart3 className="text-blue-600" /> Bảng điều khiển
        </h1>

      </div>

      {/* Thẻ thống kê (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl shadow-blue-200 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider">Tổng đơn mượn</p>
            <p className="text-4xl font-black mt-2">{totalBorrows}</p>
          </div>
          <BookOpen className="absolute right-[-10px] bottom-[-10px] text-white/10 w-32 h-32 group-hover:scale-110 transition-transform" />
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Đang mượn</p>
              <p className="text-2xl font-bold text-slate-800">{activeBorrows}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">Đã hoàn trả</p>
              <p className="text-2xl font-bold text-slate-800">{returnedBorrows}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách mượn gần đây */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Hoạt động mượn sách gần đây</h2>

        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Người mượn</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Thời gian</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {borrows.slice(0, 5).map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <User size={16} />
                      </div>
                      <span className="font-semibold text-slate-700">{item.borrowerName || "Độc giả ẩn danh"}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <span className="text-slate-400">Từ:</span> {new Date(item.borrowDate).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <span className="text-slate-400 font-normal">Hạn:</span> {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${item.status === 0
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                      }`}>
                      {item.status === 0 ? 'Chưa trả' : 'Đã trả'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;