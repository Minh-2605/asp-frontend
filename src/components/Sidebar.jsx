import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, History, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/' },
    { icon: <Book size={20}/>, label: 'Quản lý Sách', path: '/books' },
    { icon: <History size={20}/>, label: 'Đơn mượn', path: '/borrows' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-white p-4 fixed left-0 top-0">
      <div className="mb-10 px-2">
        <h2 className="text-xl font-bold text-blue-400 uppercase tracking-wider">Library Admin</h2>
        <p className="text-xs text-slate-400">Project by Phan Anh Minh</p>
      </div>
      
      <nav>
        {menuItems.map((item, index) => {
          // Kiểm tra xem item này có đang được chọn không để tô màu
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={index} 
              to={item.path} 
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-all duration-200 ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;