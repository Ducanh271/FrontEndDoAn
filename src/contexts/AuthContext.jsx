// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chạy 1 lần khi load trang để kiểm tra xem có token trong máy không
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decoded = jwtDecode(accessToken);
        setUser({
          employeeId: decoded.employee_id,
          role: decoded.role,
        });
      } catch (error) {
        console.error("Token không hợp lệ", error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  }, []);

  // Hàm gọi khi đăng nhập thành công
  const login = (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const decoded = jwtDecode(accessToken);
    setUser({
      employeeId: decoded.employee_id,
      role: decoded.role,
    });
  };

  // Hàm gọi khi đăng xuất
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải cấu hình...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
