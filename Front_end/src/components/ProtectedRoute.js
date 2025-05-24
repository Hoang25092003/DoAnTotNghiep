import React, { useEffect, useState } from 'react';
import { Spinner} from "react-bootstrap";
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Lấy token từ cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/profile`, {
          method: "GET",
          credentials: "include", // Quan trọng để gửi cookie
        });

        if (!res.ok) throw new Error("Không hợp lệ");

        const data = await res.json();
        if (data.user && data.user.user_id) {
          localStorage.setItem('user_id', data.user.user_id); // Lưu user_id vào localStorage
        }
        setUser(data.user);
      } catch (err) {
        console.log("Không thể lấy thông tin người dùng:", err);
        setUser(null);
      } finally {
        setLoading(false); // Kết thúc gọi API
      }
    };

    fetchUser();
  }, []);

  if (loading) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '80vh', background: 'linear-gradient(135deg, #e3f0ff 0%, #b6e0fe 100%)' }}>
      <img src="/img/barcode3.gif" alt="Loading..." style={{ width: 80, marginBottom: 24 }} />
      <Spinner animation="border" variant="primary" style={{ width: 48, height: 48, marginBottom: 16 }} />
      <div style={{ fontWeight: 600, fontSize: "1.2rem", color: "#0a58ca" }}>
        Hệ thống đang tải dữ liệu...
      </div>
      <div style={{ color: "#555", fontStyle: "italic", marginTop: 4 }}>
        Vui lòng chờ trong giây lát
      </div>
    </div>
  );
}

  // Chưa đăng nhập
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;