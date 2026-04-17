import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Books = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    // Gọi đến API trên Render thông qua axiosClient
    axiosClient.get('/Books')
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý kho sách</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={20}/> Thêm sách mới
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4">Tên sách</th>
              <th className="p-4">Tác giả</th>
              <th className="p-4">Thể loại</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-medium">{book.title}</td>
                <td className="p-4 text-gray-600">{book.author}</td>
                <td className="p-4">{book.category}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${book.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {book.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-3">
                  <button className="text-blue-600 hover:text-blue-800"><Edit size={18}/></button>
                  <button className="text-red-600 hover:text-red-800"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Books;