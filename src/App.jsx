import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard'; 
import Books from './pages/Books';
import Categories from './pages/Categories';
import Borrows from './pages/Borrows';
import Reviews from './pages/Reviews';
import Auth from './pages/Auth';

// 1. Tạo chốt chặn bảo vệ (ProtectedRoute)
const ProtectedRoute = ({ children }) => {
  const userData = localStorage.getItem('user');
  
  // Nếu LocalStorage trống rỗng, ép về trang login ngay
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);
    // Kiểm tra xem có token hay không (tùy vào cấu trúc res của chủ nhân)
    if (!user || (!user.token && !user.accessToken)) {
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
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
                <Route path="/reviews" element={<Reviews />} />
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