import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Book, 
  History, 
  Tags, 
  Star, 
  LogOut, 
  Library 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Danh sách menu đầy đủ các tính năng
  const menuItems = [
    { icon: <LayoutDashboard size={20}/>, label: 'Dashboard', path: '/' },
    { icon: <Book size={20}/>, label: 'Quản lý Sách', path: '/books' },
    { icon: <Tags size={20}/>, label: 'Thể loại', path: '/categories' },
    { icon: <History size={20}/>, label: 'Đơn mượn', path: '/borrows' },
    { icon: <Star size={20}/>, label: 'Đánh giá', path: '/reviews' },
  ];

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    if (window.confirm("Chủ nhân có chắc chắn muốn đăng xuất không?")) {
      localStorage.removeItem('user'); // Xóa sạch dấu vết login
      navigate('/login'); // Lôi người dùng ra trang login ngay lập tức
    }
  };

  return (
    <div className="w-64 bg-slate-950 h-screen text-white p-4 fixed left-0 top-0 flex flex-col border-r border-slate-800 shadow-2xl">
      {/* Header Sidebar */}
      <div className="mb-10 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-transparent rounded-2xl border border-blue-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Library size={24} className="text-blue-400" />
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Quản lý Thư viện</h2>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administrator Area</p>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={index} 
              to={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                {item.icon}
              </span>
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Nút Đăng xuất - Nằm ở cuối Sidebar */}
      <div className="pt-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-bold text-sm"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
        <p className="mt-4 text-[10px] text-center text-slate-600 font-medium italic">
          © 2026 Admin Panel
        </p>
      </div>
    </div>
  );
};

export default Sidebar;