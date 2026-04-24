import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Mail, Lock, User, ArrowRight, Library, AlertCircle, Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (isLogin) {
        // --- LOGIC ĐĂNG NHẬP ---
        const res = await axiosClient.post('/Users/login', {
          Username: formData.username,
          Password: formData.password
        });

        // Lưu toàn bộ thông tin (bao gồm cả Role từ DB) vào localStorage
        // Cấu trúc lưu trữ: { id, username, role, email... }
        localStorage.setItem('user', JSON.stringify(res));
        
        // Chuyển hướng về trang chủ
        navigate('/'); 
      } else {
        // --- LOGIC ĐĂNG KÝ ---
        const registerPayload = {
          Username: formData.username,
          Email: formData.email,
          PasswordHash: formData.password,
          Role: "User" // Tự động gán quyền User cho mọi tài khoản đăng ký mới
        };

        await axiosClient.post('/Users', registerPayload);
        
        alert("🎉 Chúc mừng " + formData.username + " đã đăng ký thành công! Hãy đăng nhập nhé.");
        setIsLogin(true); // Chuyển về form đăng nhập
        setFormData({ username: '', password: '', email: '' });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const backendError = err.response?.data;
      setError(typeof backendError === 'string' ? backendError : "Thông tin không hợp lệ, chủ nhân kiểm tra lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center flex items-center justify-center p-4 relative">
      {/* Overlay làm mờ nền */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
      
      <div className="relative bg-white/95 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20 animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-blue-600 rounded-2xl text-white mb-4 shadow-xl shadow-blue-200">
            <Library size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isLogin ? 'Chào mừng!' : 'Gia nhập thư viện'}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium italic">"Tri thức là chìa khóa thành công"</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-2xl flex items-center gap-3 animate-bounce">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="Tên đăng nhập" required
              value={formData.username}
              className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
              onChange={e => setFormData({...formData, username: e.target.value})}
            />
          </div>

          {!isLogin && (
            <div className="relative group animate-in slide-in-from-top-2 duration-300">
              <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" placeholder="Địa chỉ Email" required
                value={formData.email}
                className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          )}

          <div className="relative group">
            <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="password" placeholder="Mật khẩu" required
              value={formData.password}
              className="w-full pl-12 pr-4 py-4 bg-slate-100 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-blue-500 outline-none transition-all font-medium"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 group mt-6 active:scale-95"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(""); setFormData({username:'', password:'', email:''}); }}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {isLogin ? (
              <span>Chưa có tài khoản? <span className="text-blue-600">Đăng ký ngay</span></span>
            ) : (
              <span>Đã có tài khoản? <span className="text-blue-600">Đăng nhập</span></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;