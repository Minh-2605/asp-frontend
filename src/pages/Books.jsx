/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import {
  Plus, Edit, Trash2, X, BookOpen, Calendar,
  Image as ImageIcon, Search, Filter, BookText
} from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  // States cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [currentBook, setCurrentBook] = useState({
    title: '', author: '', categoryId: '', status: 'Available',
    image: '', quantity: 0
  });
  const [dueDate, setDueDate] = useState('');

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = storedUser?.role === 'Admin';

  const fetchData = async () => {
    try {
      const [catsRes, booksRes] = await Promise.all([
        axiosClient.get('/Categories'),
        axiosClient.get('/Books')
      ]);

      const rawCats = catsRes.data || catsRes;
      setCategories(rawCats.map(c => ({
        id: c.id ?? c.Id,
        name: c.name ?? c.Name
      })));

      const rawBooks = booksRes.data || booksRes;
      if (Array.isArray(rawBooks)) {
        setBooks(rawBooks.map(b => ({
          id: b.id ?? b.Id,
          title: b.title ?? b.Title,
          author: b.author ?? b.Author,
          categoryId: b.categoryId ?? b.CategoryId,
          quantity: b.quantity ?? b.Quantity,
          image: b.image ?? b.Image,
          status: b.status ?? b.Status
        })));
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC TÌM KIẾM VÀ LỌC ---
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || String(book.categoryId) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (id) => {
    const cat = categories.find(c => Number(c.id) === Number(id));
    return cat ? (cat.name || cat.Name) : 'Chưa phân loại';
  };

  const handleDelete = async (id) => {
    if (window.confirm("Chủ nhân có chắc chắn muốn xóa cuốn sách này không?")) {
      try {
        await axiosClient.delete(`/Books/${id}`);
        alert("Xóa sách thành công!");
        fetchData(); // Tải lại danh sách sau khi xóa
      } catch (err) {
        console.error("Lỗi khi xóa:", err);
        alert("Không thể xóa sách. Có thể sách này đang được mượn!");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCurrentBook({ ...currentBook, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    try {
      // Lấy thông tin user từ localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));

      const borrowData = {
        // 1. Phải khớp chính xác tên thuộc tính trong Borrow.cs (viết hoa chữ cái đầu)
        BookId: currentBook.Id ?? currentBook.id,
        UserId: storedUser?.Id ?? storedUser?.id, // Đảm bảo đây là chuỗi GUID
        BorrowerName: storedUser?.FullName ?? storedUser?.UserName ?? "Người mượn", // BẮT BUỘC có trường này
        BorrowDate: new Date().toISOString(),
        DueDate: new Date(dueDate).toISOString(),
        Status: 0, // 0 tương ứng với BorrowStatus.BORROWED trong C#
        CreatedAt: new Date().toISOString()
      };

      console.log("Dữ liệu gửi đi:", borrowData);

      // 2. Sử dụng đúng endpoint /Borrows (đã xác nhận ở bước trước)
      await axiosClient.post('/Borrows', borrowData);

      alert("Mượn sách thành công!");
      setIsBorrowModalOpen(false);
      fetchData(); // Cập nhật lại số lượng sách trên giao diện
    } catch (err) {
      console.error("Lỗi chi tiết:", err.response?.data);
      const errorMsg = err.response?.data?.errors
        ? JSON.stringify(err.response.data.errors)
        : "Kiểm tra lại BorrowerName hoặc UserId (phải là GUID)!";
      alert("Không thể mượn sách: " + errorMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        Title: currentBook.title,
        Author: currentBook.author,
        CategoryId: parseInt(currentBook.categoryId),
        Quantity: parseInt(currentBook.quantity),
        Image: currentBook.image,
        Status: currentBook.status
      };

      if (currentBook.id) {
        await axiosClient.put(`/Books/${currentBook.id}`, { Id: currentBook.id, ...dataToSave });
      } else {
        await axiosClient.post('/Books', dataToSave);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("Lỗi lưu sách!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-[900] text-slate-900 tracking-tight flex items-center gap-3">
              <BookText className="text-blue-600" size={36} />
              THƯ VIỆN SÁCH
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Quản lý và mượn sách trực tuyến • Chào, <span className="text-blue-600 font-bold">{storedUser?.username}</span>
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                setCurrentBook({ title: '', author: '', categoryId: categories[0]?.id || '', status: 'Available', image: '', quantity: 0 });
                setIsModalOpen(true);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
            >
              <Plus size={20} /> Thêm sách mới
            </button>
          )}
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
              className="w-full bg-white border-none shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 p-4 pl-12 rounded-2xl outline-none transition-all font-medium text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="w-full bg-white border-none shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-600 appearance-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">Tất cả thể loại</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* MAIN DATA TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Thông tin sách</th>
                  <th className="px-8 py-5 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Thể loại</th>
                  <th className="px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Số lượng</th>
                  <th className="px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBooks.map(book => (
                  <tr key={book.id} className="hover:bg-blue-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-24 bg-slate-100 rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105">
                          {book.image ? (
                            <img src={book.image} alt="cover" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} /></div>
                          )}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-lg uppercase tracking-tight leading-tight">{book.title}</div>
                          <div className="text-sm text-slate-400 font-bold mt-1">Tác giả: {book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-tighter ring-1 ring-blue-100">
                        {getCategoryName(book.categoryId)}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`text-xl font-black ${book.quantity > 0 ? 'text-slate-700' : 'text-red-400'}`}>
                        {book.quantity}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">quyển</div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        {isAdmin ? (
                          <>
                            <button onClick={() => { setCurrentBook(book); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"><Edit size={18} /></button>
                            <button onClick={() => handleDelete(book.id)} className="p-3 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                          </>
                        ) : (
                          book.quantity > 0 ? (
                            <button
                              onClick={() => { setCurrentBook(book); setIsBorrowModalOpen(true); }}
                              className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-emerald-600 transition-all text-xs shadow-lg shadow-emerald-100 active:scale-95"
                            >
                              <BookOpen size={16} /> MƯỢN SÁCH
                            </button>
                          ) : (
                            <span className="bg-slate-100 text-slate-400 px-6 py-2.5 rounded-xl text-xs font-black uppercase">Đã hết</span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBooks.length === 0 && (
              <div className="p-20 text-center text-slate-400 font-bold italic">
                Không tìm thấy cuốn sách nào phù hợp...
              </div>
            )}
          </div>
        </div>
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
