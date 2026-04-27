/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit, Trash2, X, BookOpen, Calendar, Image as ImageIcon } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  // State dùng camelCase để đồng bộ với logic xử lý bên dưới
  const [currentBook, setCurrentBook] = useState({
    title: '', author: '', categoryId: '', status: 'Available',
    image: '', quantity: 0
  });
  const [dueDate, setDueDate] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = storedUser?.role === 'Admin';

  // --- LOGIC TẢI DỮ LIỆU & CHUẨN HÓA ---
  const fetchData = async () => {
    // 1. Lấy Categories trước
    try {
      const catsRes = await axiosClient.get('/Categories');
      const rawCats = catsRes.data || catsRes;
      setCategories(rawCats.map(c => ({
        id: c.id ?? c.Id,
        name: c.name ?? c.Name
      })));
    } catch (err) { console.error("Lỗi Categories:", err); }

    // 2. Lấy Books sau (Tách ra để lỗi Books không làm mất Categories)
    try {
      const booksRes = await axiosClient.get('/Books');
      const rawBooks = booksRes.data || booksRes;

      // Log ra để xem cấu trúc thực tế
      console.log("Dữ liệu Books từ API:", rawBooks);

      if (Array.isArray(rawBooks)) {
        const normalizedBooks = rawBooks.map(b => ({
          id: b.id ?? b.Id,
          title: b.title ?? b.Title,
          author: b.author ?? b.Author,
          categoryId: b.categoryId ?? b.CategoryId,
          quantity: b.quantity ?? b.Quantity,
          image: b.image ?? b.Image,
          status: b.status ?? b.Status
        }));
        setBooks(normalizedBooks);
      }
    } catch (err) {
      console.error("Lỗi Books:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getCategoryName = (id) => {
    const cat = categories.find(c => Number(c.id) === Number(id));
    // Kiểm tra cả 'name' và 'Name' để chắc chắn không bị trống tên thể loại trên bảng
    return cat ? (cat.name || cat.Name) : 'Chưa phân loại';
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentBook({ ...currentBook, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi dữ liệu theo đúng tên thuộc tính trong C# Model (PascalCase)
      const dataToSave = {
        Title: currentBook.title,
        Author: currentBook.author,
        CategoryId: parseInt(currentBook.categoryId),
        Quantity: parseInt(currentBook.quantity),
        Image: currentBook.image,
        Status: currentBook.status
      };

      if (currentBook.id) {
        // Nếu là sửa, cần gửi cả Id
        await axiosClient.put(`/Books/${currentBook.id}`, {
          Id: currentBook.id,
          ...dataToSave
        });
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

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    if (!storedUser?.id) {
      alert("Vui lòng đăng nhập lại để mượn sách!");
      return;
    }

    const payload = {
      bookId: currentBook.id,
      userId: storedUser.id,
      borrowerName: storedUser.username,
      dueDate: new Date(dueDate).toISOString(),
    };

    try {
      await axiosClient.post('/Borrows', payload);
      alert(`🎉 Đã đăng ký mượn cuốn: ${currentBook.title}`);
      setIsBorrowModalOpen(false);
      setDueDate('');
      fetchData();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data || "Không thể mượn sách"));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Thư viện sách</h1>
          <p className="text-sm text-slate-500 font-medium">Xin chào, <span className="text-blue-600">{storedUser?.username}</span></p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setCurrentBook({ title: '', author: '', categoryId: categories[0]?.id || '', status: 'Available', image: '', quantity: 0 });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100"
          >
            <Plus size={20} /> Thêm sách mới
          </button>
        )}
      </div>

      {/* TABLE HIỂN THỊ */}
      <div className="bg-white shadow-xl shadow-slate-100 border border-slate-100 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-widest border-b">
            <tr>
              <th className="p-6">Thông tin sách</th>
              <th className="p-6">Thể loại</th>
              <th className="p-6 text-center">Kho</th>
              <th className="p-6 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {books.map(book => (
              <tr key={book.id} className="hover:bg-slate-50/50 transition group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-20 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
                      {book.image ? (
                        <img src={book.image} alt="book" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                      )}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 text-lg uppercase leading-tight">{book.title}</div>
                      <div className="text-sm text-slate-400 font-bold">{book.author}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {getCategoryName(book.categoryId)}
                  </span>
                </td>
                <td className="p-6 text-center font-black text-slate-600">
                  {book.quantity}
                </td>
                <td className="p-6 text-center">
                  <div className="flex justify-center gap-3">
                    {isAdmin ? (
                      <>
                        <button onClick={() => { setCurrentBook(book); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={20} /></button>
                        <button onClick={() => handleDelete(book.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
                      </>
                    ) : (
                      book.quantity > 0 ? (
                        <button
                          onClick={() => { setCurrentBook(book); setIsBorrowModalOpen(true); }}
                          className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-black flex items-center gap-1 hover:bg-emerald-700 transition-all text-xs shadow-lg shadow-emerald-100"
                        >
                          <BookOpen size={16} /> MƯỢN NGAY
                        </button>
                      ) : (
                        <span className="bg-slate-100 text-slate-400 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter">Hết sách</span>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ADMIN: THÊM/SỬA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{currentBook.id ? 'Cập nhật' : 'Thêm mới'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hình ảnh bìa</label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                    {currentBook.image ? <img src={currentBook.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>
              <input className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" placeholder="Tên sách" value={currentBook.title} onChange={e => setCurrentBook({ ...currentBook, title: e.target.value })} required />
              <input className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" placeholder="Tác giả" value={currentBook.author} onChange={e => setCurrentBook({ ...currentBook, author: e.target.value })} required />
              <div className="flex gap-4">
                <select
                  className="flex-1 bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold"
                  value={currentBook.categoryId}
                  onChange={e => setCurrentBook({ ...currentBook, categoryId: e.target.value })}
                  required
                >
                  <option value="">-- Thể loại --</option>
                  {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input type="number" className="w-24 bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-center" placeholder="SL" value={currentBook.quantity} onChange={e => setCurrentBook({ ...currentBook, quantity: e.target.value })} required min="0" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all mt-4">Lưu sách</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL USER: MƯỢN SÁCH */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-2xl mb-4">
                <Calendar size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">Hẹn ngày trả</h2>
              <p className="text-slate-500 text-sm mt-1 italic">"{currentBook.title}"</p>
            </div>
            <form onSubmit={handleBorrowSubmit} className="space-y-5">
              <input
                type="date" required
                min={new Date().toISOString().split("T")[0]}
                className="w-full border-2 border-slate-100 p-4 rounded-2xl focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all bg-slate-50"
                value={dueDate} onChange={e => setDueDate(e.target.value)}
              />
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsBorrowModalOpen(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Hủy</button>
                <button type="submit" className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 uppercase text-xs tracking-widest">Xác nhận mượn</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;