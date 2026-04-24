import React from 'react';
import Sidebar from '../components/Sidebar';
import { Bell, Search, User } from 'lucide-react';

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Nâng cấp hiệu ứng đổ bóng */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* Header - Thanh công cụ phía trên */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="relative w-96">

            
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-slate-500 hover:text-blue-600 transition">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">Anh Minh</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Nội dung chính của trang */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            {children}
          </div>
        </main>

        {/* Footer nhỏ nhẹ */}
        <footer className="mt-auto p-8 text-center text-slate-400 text-xs">
          © 2026 Library Management System • Design by Minh
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;