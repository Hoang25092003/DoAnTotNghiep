import React, { useState, useEffect } from "react";
import { Container, Row, Col, Navbar, Button, Nav, Collapse, Dropdown, Spinner, Offcanvas } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faUser, faSignOutAlt, faChevronDown, faChevronUp, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const Layout = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showReportSubmenu, setShowReportSubmenu] = useState(false);
  const [showReportSubmenu1, setShowReportSubmenu1] = useState(false);
  const [showReportSubmenu2, setShowReportSubmenu2] = useState(false);
  const [user, setUser] = useState(null); // State to store logged-in user
  const navigate = useNavigate();

  useEffect(() => {
    // Gọi API để lấy thông tin người dùng từ cookie
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/profile`, {
          method: "GET",
          credentials: "include", // Quan trọng để gửi cookie
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
          navigate("/login");
        }
      } catch (err) {
        console.error("Không thể lấy thông tin người dùng:", err);
        setUser(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleReportSubmenu = () => setShowReportSubmenu(!showReportSubmenu);
  const toggleReportSubmenu1 = () => setShowReportSubmenu1(!showReportSubmenu1);
  const toggleReportSubmenu2 = () => setShowReportSubmenu2(!showReportSubmenu2);

  const handleLogout = async () => {
    setSidebarOpen(false);
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);

      toast.success(
        <div className='text-center'>
          <span role="img" aria-label="logout" style={{ fontSize: "1.5rem" }}>👋</span>
          <b> Đăng xuất thành công!</b>
          <div>Hẹn gặp lại bạn lần sau.</div>
        </div>,
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
          icon: false,
          style: { fontSize: "1.1rem", background: "#e3fcec", color: "#1e4620" }
        }
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800); // Đợi toast xong mới chuyển trang
    } catch (err) {
      toast.error("Lỗi khi đăng xuất!");
      console.error("Lỗi khi logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" style={{ position: "fixed", top: 0, width: "100%", zIndex: 1030 }}>
        <Container fluid>
          {/* Sidebar Toggle Button */}
          <Button
            variant="dark"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Đóng Sidebar" : "Mở Sidebar"}
            className="ms-2"
          >
            <FontAwesomeIcon icon={faBars} />
          </Button>
          <Navbar.Brand as={NavLink} to="/">📦 Quản Lý Kho</Navbar.Brand>
          {user && (
            <Nav className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  className="d-flex align-items-center text-white text-decoration-none"
                  id="dropdown-user"
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  {user.fullname} ({user.role === "admin" ? "Quản trị viên" : "Nhân viên"})
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      navigate("/profile");
                    }}
                  >
                    <FontAwesomeIcon icon={faUserEdit} className="me-2" />Tài khoản của tôi
                  </Dropdown.Item>

                  <Dropdown.Item
                    onClick={handleLogout}
                    style={{ color: "red" }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          )}

        </Container>
      </Navbar>

      {/* Sidebar Offcanvas */}
      <Offcanvas
        show={isSidebarOpen}
        onHide={closeSidebar}
        backdrop={true}
        scroll={true}
        placement="start"
        style={{
          width: 330,
          top: 56,
          background: "linear-gradient(135deg,rgb(79, 126, 230) 0%,rgb(67, 101, 212) 100%)"
        }}>
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="text-white">Menu quản lý</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link className="text-white" as={NavLink} to="/" onClick={closeSidebar}>
              🏠 Trang chủ
            </Nav.Link>
            {user?.role === "admin" && (
              <>
                <Nav.Link className="text-white" as={NavLink} to="/products" onClick={closeSidebar}>
                  📋 Quản lý thông tin sản phẩm
                </Nav.Link>
                <Nav.Link className="text-white" as={NavLink} to="/warehouse" onClick={closeSidebar}>
                  🏢 Quản lý thông tin kho hàng
                </Nav.Link>
                <Nav.Link className="text-white" as={NavLink} to="/suppliers" onClick={closeSidebar}>
                  🏭 Quản lý thông tin nhà cung cấp
                </Nav.Link>
                <Nav.Link className="text-white" as={NavLink} to="/account" onClick={closeSidebar}>
                  👤 Quản lý thông tin tài khoản
                </Nav.Link>
                <Nav.Link className="text-white" as={NavLink} to="/category" onClick={closeSidebar}>
                  🗂️ Quản lý thông tin danh mục
                </Nav.Link>
                <Nav.Link className="text-white" onClick={toggleReportSubmenu2}>
                  🛠️ Quản lý thiết bị{" "}
                  <FontAwesomeIcon icon={showReportSubmenu2 ? faChevronUp : faChevronDown} className="float-end" />
                </Nav.Link>
                <Collapse in={showReportSubmenu2}>
                  <div className="ms-3">
                    <Nav.Link className="text-white" as={NavLink} to="/devices" onClick={closeSidebar}>
                      ℹ️ Thông tin thiết bị
                    </Nav.Link>
                    <Nav.Link className="text-white" as={NavLink} to="/deviceAuth" onClick={closeSidebar}>
                      🔐 Phân quyền thiết bị
                    </Nav.Link>
                  </div>
                </Collapse>
                <Nav.Link className="text-white" as={NavLink} to="/actionlog" onClick={closeSidebar}>
                  📜 Nhật ký hành động
                </Nav.Link>
                <Nav.Link className="text-white" as={NavLink} to="/backup" onClick={closeSidebar}>
                  💾 Sao lưu & khôi phục dữ liệu
                </Nav.Link>
              </>
            )}
            <Nav.Link className="text-white" onClick={toggleReportSubmenu}>
              📦 Quản lý hàng hóa{" "}
              <FontAwesomeIcon icon={showReportSubmenu ? faChevronUp : faChevronDown} className="float-end" />
            </Nav.Link>
            <Collapse in={showReportSubmenu}>
              <div className="ms-3">
                <Nav.Link className="text-white" as={NavLink} to="/import" onClick={closeSidebar}>
                  📥 Nhập hàng
                </Nav.Link>
                <Nav.Link className="text-white" as={NavLink} to="/export" onClick={closeSidebar}>
                  📤 Xuất hàng
                </Nav.Link>
                <Nav.Link className="text-white" as={NavLink} to="/check" onClick={closeSidebar}>
                  🔍 Kiểm hàng
                </Nav.Link>
              </div>
            </Collapse>
            {user?.role === "admin" && (
              <>
                <Nav.Link className="text-white" onClick={toggleReportSubmenu1}>
                  📊 Báo cáo{" "}
                  <FontAwesomeIcon icon={showReportSubmenu1 ? faChevronUp : faChevronDown} className="float-end" />
                </Nav.Link>
                <Collapse in={showReportSubmenu1}>
                  <div className="ms-3">
                    <Nav.Link className="text-white" as={NavLink} to="/create_report" onClick={closeSidebar}>
                      📄 Tạo báo cáo
                    </Nav.Link>
                    <Nav.Link className="text-white" as={NavLink} to="/history_report" onClick={closeSidebar}>
                      📚 Lịch sử báo cáo
                    </Nav.Link>
                  </div>
                </Collapse>
              </>
            )}
            {user?.role === "staff" && (
              <>
                <Nav.Link className="text-white" as={NavLink} to="/create_report" onClick={closeSidebar}>
                  📄 Tạo báo cáo
                </Nav.Link>
              </>
            )}
            {user && (
              <Nav.Link className="text-danger d-flex align-items-center" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Đăng xuất
              </Nav.Link>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main content */}
      <Container fluid>
        <Row>
          <Col
            onClick={() => setSidebarOpen(false)}
            md={12} className="p-4"
            style={{
              marginTop: "50px",
            }}
          >
            {children}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Layout;
