import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Categories from './pages/Categories';
import Borrows from './pages/Borrows';
import Auth from './pages/Auth';

// 1. Tạo chốt chặn bảo vệ (ProtectedRoute)
const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('user');

  // 1. Dùng biến trung gian để lưu kết quả kiểm tra
  let isLogged = false;

  // 2. Chỉ thực hiện logic "xử lý dữ liệu" trong try/catch
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user && (user.token || user.accessToken)) {
        isLogged = true;
      }
    } catch {
      isLogged = false;
    }
  }

  // 3. Lệnh return JSX PHẢI nằm ngoài try/catch
  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang Login công khai */}
        <Route path="/login" element={<Auth />} />

        {/* 2. Tất cả các trang quản trị phải đi qua ProtectedRoute */}
        <Route path="/*" element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/borrows" element={<Borrows />} />

                {/* Trang 404 hoặc mặc định */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;