/* eslint-disable */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axiosClient from '../api/axiosClient';
import { Loader2, AlertTriangle, BookOpen, Trash2, CheckCircle } from 'lucide-react';

const Borrows = () => {
  const [borrows, setBorrows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Lấy User và giữ cố định bằng useMemo
  const storedUser = useMemo(() => {
    const data = localStorage.getItem('user');
    if (!data) return null;
    try {
      const u = JSON.parse(data);
      return {
        id: u.id || u.Id || u.userId,
        username: u.username || u.Username,
        role: (u.role || u.Role || 'User').toString().toLowerCase()
      };
    } catch {
      return null;
    }
  }, []);

  const isAdmin = storedUser?.role === 'admin';

  // 2. Hàm lấy dữ liệu - Dùng tham số nội bộ để xử lý an toàn
  const fetchData = useCallback(async (isMounted) => {
    if (isMounted) setIsLoading(true);
    try {
      const res = await axiosClient.get('/Borrows');
      const rawData = Array.isArray(res) ? res : (res.data || []);

      if (isMounted) {
        if (isAdmin) {
          setBorrows(rawData);
        } else {
          const myId = storedUser?.id?.toString().toLowerCase();
          const filtered = rawData.filter(item => {
            const itemUserId = (item.userId || item.UserId)?.toString().toLowerCase();
            return itemUserId === myId;
          });
          setBorrows(filtered);
        }
      }
    } catch {
      console.log("Lỗi kết nối");
    } finally {
      if (isMounted) setIsLoading(false);
    }
  }, [isAdmin, storedUser?.id]);

  // 3. Effect để tự động fetch khi vào trang
  useEffect(() => {
    let active = true;
    fetchData(active);
    return () => { active = false; };
  }, [fetchData]);

  // 4. Hàm xử lý Trả sách
  const handleReturn = async (id) => {
    if (!window.confirm("Xác nhận đã thu hồi sách này?")) return;
    try {
      await axiosClient.put(`/Borrows/return/${id}`);
      fetchData(true);
    } catch {
      alert("Lỗi cập nhật");
    }
  };

  // 5. Hàm xử lý Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa?")) return;
    try {
      await axiosClient.delete(`/Borrows/${id}`);
      fetchData(true);
    } catch {
      alert("Lỗi xóa");
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-blue-500" size={40} />
      <p className="text-slate-400 font-medium italic">Đang tải lịch sử...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <BookOpen className="text-blue-600" size={36} />
            {isAdmin ? "QUẢN LÝ MƯỢN TRẢ" : "LỊCH SỬ MƯỢN SÁCH"}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Xin chào, <span className="text-blue-600 font-bold">{storedUser?.username}</span>
            {isAdmin ? " (Quản trị viên)" : " (Thành viên)"}
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-right">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng đơn</div>
          <div className="text-3xl font-black text-slate-700">{borrows.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Người mượn</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên Sách</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
              {isAdmin && <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hành động</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {borrows.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="p-6">
                  <div className="font-bold text-slate-700">{item.borrowerName || "Thành viên"}</div>
                  <div className="text-[10px] text-slate-400 font-mono">UID: {item.userId?.substring(0, 8)}...</div>
                </td>
                <td className="p-6">
                  <div className="font-extrabold text-slate-800">{item.book?.title || `Sách #${item.bookId}`}</div>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${item.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.status === 1 ? 'Đã trả' : 'Đang mượn'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      {item.status !== 1 && (
                        <button onClick={() => handleReturn(item.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100">
                          TRẢ SÁCH
                        </button>
                      )}
                      <button onClick={() => handleDelete(item.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {borrows.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <AlertTriangle className="text-slate-200" size={48} />
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Không tìm thấy dữ liệu</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Borrows;