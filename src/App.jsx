// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './Register'; // Chú ý đổi tên file/hàm cũ thành Register.jsx nhé
import Identify from './Identify';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-white font-bold text-xl tracking-wider">🔒 DeepGuard Web</h1>
        <div className="flex gap-4">
          <Link to="/" className={`px-4 py-2 rounded-md font-medium transition-colors ${location.pathname === '/' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            Đăng Ký Nhân Viên
          </Link>
          <Link to="/identify" className={`px-4 py-2 rounded-md font-medium transition-colors ${location.pathname === '/identify' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            Nhận Diện (Điểm Danh)
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="py-8">
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/identify" element={<Identify />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
