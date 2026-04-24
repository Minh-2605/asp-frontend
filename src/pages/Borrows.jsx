import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { History, Loader2, AlertTriangle, BookOpen } from 'lucide-react';

const Borrows = () => {
  const [borrows, setBorrows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLoggedUser = () => {
    const data = localStorage.getItem('user');
    if (!data) return null;
    try {
      const u = JSON.parse(data);
      return {
        id: u.id || u.Id || u.userId,
        username: u.username || u.Username,
        role: (u.role || u.Role || 'User').toString().toLowerCase()
      };
    } catch (e) { return null; }
  };

  const storedUser = getLoggedUser();
  const isAdmin = storedUser?.role === 'admin';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axiosClient.get('/Borrows');
      // Xử lý trường hợp API trả về trực tiếp mảng hoặc bọc trong .data
      const rawData = Array.isArray(res) ? res : (res.data || []);
      
      console.log("Dữ liệu gốc từ DB:", rawData); // Chủ nhân check F12 xem có thấy mã cbb0b... không

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
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" size={40}/></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 flex items-center gap-3">
          <BookOpen className="text-blue-600" size={36} />
          {isAdmin ? "HỆ THỐNG QUẢN LÝ" : "SÁCH BẠN ĐANG MƯỢN"}
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Xin chào, <span className="text-blue-600 font-bold">{storedUser?.username}</span> 
          {isAdmin ? " (Quản trị viên)" : " (Thành viên)"}
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Người mượn</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tên Sách</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Hạn trả</th>
              <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {borrows.length > 0 ? (
              borrows.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-6">
                    <div className="font-bold text-slate-700">{item.borrowerName || "N/A"}</div>
                    <div className="text-[10px] text-slate-400 font-mono">User ID: {item.userId?.substring(0,8)}...</div>
                  </td>
                  <td className="p-6 font-extrabold text-blue-600">
                    {item.book?.title || `Mã sách: ${item.bookId}`}
                  </td>
                  <td className="p-6 text-slate-500 font-medium">
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString('vi-VN') : "--"}
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                      item.status === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 1 ? 'Đã trả' : 'Đang mượn'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <AlertTriangle size={48} className="text-slate-200" />
                    <div className="text-slate-400 font-bold">Không tìm thấy dữ liệu mượn sách nào!</div>
                    <p className="text-slate-300 text-sm max-w-xs">
                      Lưu ý: ID người mượn trong DB phải khớp chính xác với ID tài khoản đang đăng nhập.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Borrows;