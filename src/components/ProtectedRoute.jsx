// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireRole }) {
  const { user } = useAuth();

  // 1. Chưa đăng nhập -> Đá văng ra trang Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã đăng nhập nhưng không đủ quyền hạn -> Báo lỗi
  if (requireRole && user.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-3xl font-bold text-red-600 mb-4">⛔ Truy Cập Bị Từ Chối</h2>
          <p className="text-gray-700 text-lg">Bạn không có quyền truy cập vào khu vực của Quản trị viên.</p>
        </div>
      </div>
    );
  }

  // 3. Đủ điều kiện -> Cho phép đi tiếp vào Component con
  return children;
}
