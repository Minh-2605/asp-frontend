import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit, Trash2, X, BookOpen, Calendar } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false); // Modal mượn dành cho User
  const [currentBook, setCurrentBook] = useState({ title: '', author: '', categoryId: '', status: 'Available' });
  const [dueDate, setDueDate] = useState(''); // Ngày trả khách chọn

  // Lấy thông tin User đã lưu từ Auth.jsx
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = storedUser?.role === 'Admin';

  const fetchData = async () => {
    try {
      const [booksRes, catsRes] = await Promise.all([
        axiosClient.get('/Books'),
        axiosClient.get('/Categories')
      ]);
      setBooks(booksRes || []); 
      setCategories(catsRes || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'Chưa phân loại';
  };

  // --- LOGIC CHO ADMIN (THÊM/SỬA/XÓA) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...currentBook, categoryId: parseInt(currentBook.categoryId) };
      if (currentBook.id) {
        await axiosClient.put(`/Books/${currentBook.id}`, dataToSave);
      } else {
        await axiosClient.post('/Books', dataToSave);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.title || "Không thể lưu sách"));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa cuốn sách này?")) {
      await axiosClient.delete(`/Books/${id}`);
      fetchData();
    }
  };

  // --- LOGIC CHO USER (TỰ ĐỘNG LẤY USERID VÀ MƯỢN SÁCH) ---
  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    if (!storedUser?.id) {
      alert("Vui lòng đăng nhập lại để mượn sách!");
      return;
    }

    const payload = {
      bookId: currentBook.id,
      userId: storedUser.id, // TỰ ĐỘNG lấy ID người đăng nhập
      borrowerName: storedUser.username, // TỰ ĐỘNG lấy tên tài khoản
      dueDate: new Date(dueDate).toISOString(),
    };

    try {
      await axiosClient.post('/Borrows', payload);
      alert(`🎉 Đã đăng ký mượn cuốn: ${currentBook.title}`);
      setIsBorrowModalOpen(false);
      setDueDate('');
      fetchData(); // Load lại để cập nhật trạng thái sách
    } catch (err) {
      alert("Lỗi: " + (err.response?.data || "Không thể mượn sách"));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thư viện sách</h1>
          <p className="text-sm text-slate-500">Xin chào, <span className="font-bold text-blue-600">{storedUser?.username}</span> ({storedUser?.role})</p>
        </div>
        
        {/* Chỉ ADMIN mới thấy nút Thêm sách */}
        {isAdmin && (
          <button 
            onClick={() => { setCurrentBook({ title: '', author: '', categoryId: categories[0]?.id || '', status: 'Available' }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Plus size={20}/> Thêm sách mới
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
            <tr>
              <th className="p-4">Tên sách</th>
              <th className="p-4">Tác giả</th>
              <th className="p-4">Thể loại</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {books.map(book => (
              <tr key={book.id} className="hover:bg-slate-50/50 transition">
                <td className="p-4 font-medium text-slate-700">{book.title}</td>
                <td className="p-4 text-slate-600">{book.author}</td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium">
                    {getCategoryName(book.categoryId)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    {isAdmin ? (
                      /* Nút dành cho ADMIN */
                      <>
                        <button onClick={() => { setCurrentBook(book); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(book.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                      </>
                    ) : (
                      /* Nút dành cho USER: Chỉ hiện nếu sách đang Available */
                      book.status === 'Available' ? (
                        <button 
                          onClick={() => { setCurrentBook(book); setIsBorrowModalOpen(true); }}
                          className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-600 hover:text-white transition-all text-sm"
                        >
                          <BookOpen size={16}/> Mượn ngay
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-sm">Đã được mượn</span>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ADMIN: THÊM/SỬA SÁCH */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">{currentBook.id ? 'Cập nhật sách' : 'Thêm sách mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full border border-slate-300 p-2 rounded-lg outline-none" placeholder="Tên sách" value={currentBook.title} onChange={e => setCurrentBook({...currentBook, title: e.target.value})} required />
              <input className="w-full border border-slate-300 p-2 rounded-lg outline-none" placeholder="Tác giả" value={currentBook.author} onChange={e => setCurrentBook({...currentBook, author: e.target.value})} required />
              <select className="w-full border border-slate-300 p-2 rounded-lg outline-none" value={currentBook.categoryId} onChange={e => setCurrentBook({...currentBook, categoryId: e.target.value})} required>
                <option value="">-- Thể loại --</option>
                {categories.map(cat => ( <option key={cat.id} value={cat.id}>{cat.name}</option> ))}
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700">Lưu dữ liệu</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL USER: NHẬP NGÀY TRẢ ĐỂ MƯỢN SÁCH */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm animate-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
                <Calendar size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Hẹn ngày trả</h2>
              <p className="text-slate-500 text-sm mt-1">Chủ nhân định khi nào sẽ trả cuốn <br/> <span className="font-bold text-slate-700 italic">"{currentBook.title}"</span>?</p>
            </div>
            <form onSubmit={handleBorrowSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1">Chọn ngày trả sách</label>
                <input 
                  type="date" required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all bg-slate-50"
                  value={dueDate} onChange={e => setDueDate(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsBorrowModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Hủy</button>
                <button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95">
                  XÁC NHẬN MƯỢN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;