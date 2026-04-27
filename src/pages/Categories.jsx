/* eslint-disable */
import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit, Trash2, FolderTree, AlertCircle, Loader2, X, Save } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trạng thái phục vụ chỉnh sửa
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Categories');
      const data = Array.isArray(res) ? res : (res.data || []);
      setCategories(data);
    } catch (err) {
      setError("Không thể tải danh mục.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // Hàm xử lý chung cho cả Thêm và Sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Gửi lệnh PUT để cập nhật
        await axiosClient.put(`/Categories/${editingId}`, {
          Id: editingId,
          Name: name
        });
        setEditingId(null); // Thoát chế độ sửa
      } else {
        // Gửi lệnh POST để thêm mới
        await axiosClient.post('/Categories', { Name: name });
      }
      setName('');
      fetchCategories();
    } catch (err) {
      alert("Thao tác thất bại, chủ nhân kiểm tra lại Backend nhé!");
    }
  };

  // Khi bấm nút Sửa trên dòng
  const startEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name || cat.Name); // Đưa tên cũ lên ô input
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Chủ nhân có chắc muốn xóa?")) {
      try {
        await axiosClient.delete(`/Categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert("Lỗi: Danh mục này có thể đang chứa sách!");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
          <FolderTree className="text-blue-600" />
          Quản lý danh mục
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form linh hoạt: Thêm hoặc Sửa */}
        <div className={`p-6 rounded-3xl border transition-all duration-300 ${editingId ? 'border-orange-200 bg-orange-50/30' : 'border-slate-100 bg-white'}`}>
          <h2 className="text-lg font-bold mb-4 text-slate-700">
            {editingId ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full border-2 border-slate-100 bg-white p-3 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm"
              placeholder="Tên danh mục..."
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button className={`flex-1 text-white py-3 rounded-2xl font-bold transition-all active:scale-95 flex justify-center items-center gap-2 ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {editingId ? 'Cập nhật' : 'Thêm ngay'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-slate-200 text-slate-600 px-4 rounded-2xl hover:bg-slate-300 transition-all"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Danh sách danh mục */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Mã</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase">Tên</th>
                <th className="p-5 text-center text-xs font-bold text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map(cat => (
                <tr key={cat.id} className={`hover:bg-blue-50/30 transition-colors ${editingId === cat.id ? 'bg-orange-50' : ''}`}>
                  <td className="p-5 text-slate-400 font-mono text-xs">#{cat.id?.toString().slice(0, 5)}</td>
                  <td className="p-5 font-bold text-slate-700">{cat.name || cat.Name}</td>
                  <td className="p-5 flex justify-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
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

export default Categories;