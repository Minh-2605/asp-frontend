import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard'; // Dùng file Dashboard em đã gửi lượt trước

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Books" element={<div className="text-2xl font-bold">Trang Quản lý Sách (Sắp có)</div>} />
          <Route path="/Borrows" element={<div className="text-2xl font-bold">Trang Đơn mượn (Sắp có)</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;