// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Register from './Register';
import Identify from './Identify';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-white font-bold text-xl tracking-wider">🔒 DeepGuard Web</h1>
        <div className="flex gap-4 items-center">

          <Link to="/identify" className={`px-4 py-2 rounded-md font-medium transition-colors ${location.pathname === '/identify' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
            Nhận Diện Khuôn Mặt
          </Link>

          {/* Chỉ hiện nút Đăng ký nếu là ADMIN */}
          {user?.role === 'ADMIN' && (
            <Link to="/register" className={`px-4 py-2 rounded-md font-medium transition-colors ${location.pathname === '/register' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
              Quản Lý Cấp Tài Khoản
            </Link>
          )}

          {/* Logic hiện nút Login / Logout */}
          {!user ? (
            <Link to="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">Đăng Nhập</Link>
          ) : (
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700">Đăng Xuất</button>
          )}
        </div>
      </div>
    </nav>
  );
}

// Bọc Navigation trong 1 component riêng để dùng được useNavigate
function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/identify" element={<Identify />} />

          {/* Protected Routes (Khu vực VIP) */}
          <Route
            path="/register"
            element={
              <ProtectedRoute requireRole="ADMIN">
                <Register />
              </ProtectedRoute>
            }
          />

          {/* Mặc định chuyển hướng */}
          <Route path="/" element={<Identify />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
