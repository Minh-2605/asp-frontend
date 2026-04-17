import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { BookOpen, User, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [borrows, setBorrows] = useState([]);

  useEffect(() => {
    axiosClient.get('/Borrows')
      .then(res => setBorrows(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Thống kê mượn sách</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-500 text-white rounded-lg shadow">
          <p>Tổng đơn mượn</p>
          <p className="text-2xl font-bold">{borrows.length}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4">Người mượn</th>
              <th className="p-4">Ngày mượn</th>
              <th className="p-4">Hạn trả (DueDate)</th>
              <th className="p-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map(item => (
              <tr key={item.id} className="border-t">
                <td className="p-4 flex items-center gap-2"><User size={16}/> {item.borrowerName}</td>
                <td className="p-4">{new Date(item.borrowDate).toLocaleDateString()}</td>
                <td className="p-4 text-orange-600">{new Date(item.dueDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${item.status === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {item.status === 0 ? 'Đang mượn' : 'Đã trả'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;