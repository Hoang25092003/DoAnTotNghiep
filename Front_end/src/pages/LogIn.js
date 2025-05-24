import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const LogIn = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');
    if (storedUsername && storedPassword) {
      setUserName(storedUsername);
      setPassword(storedPassword);
      setRememberMe(true);
    }

  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || `Lỗi đăng nhập (HTTP ${response.status})`);
        return;
      }
      setLoading(false);
      const data = await response.json();
      if (!data) {
        console.error('Dữ liệu không hợp lệ:', data);
        toast.error('Lỗi đăng nhập! Vui lòng thử lại sau.');
        return;
      }

      // Ghi nhớ tài khoản nếu có
      if (rememberMe) {
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
      } else {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
      }
      toast.success(
        <div className='text-center'>
          <span style={{ fontSize: "1.5rem" }}>👋</span>
          <b >
            Chào mừng <br/>{data.user.fullname}
          </b>
          <div>Chúc bạn ngày làm việc hiệu quả!</div>
        </div>,
        {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          icon: false,
          style: {
            fontSize: "1.1rem",
            background: "#e3fcec",
            color: "#1e4620"
          }
        }
      );
      navigate('/');
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu đăng nhập:', err);
    }
  };

  const handlePasswordRecovery = () => {
    if (!recoveryEmail) {
      toast.warn('Vui lòng nhập email để khôi phục mật khẩu');
      return;
    }
    toast.info(`Mã khôi phục sẽ được gửi đến email: ${recoveryEmail}. Hãy chờ đợi giây lát`);
    setShowRecoveryModal(false);
    setRecoveryEmail('');
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100" style={{ maxWidth: '1300px' }}>
        <Col md={8} className="d-flex flex-column justify-content-center align-items-center">
          <Row className="d-flex flex-column align-items-center justify-content-center text-center">
            <h1 className="text-danger mb-4">ĐỒ ÁN TỐT NGHIỆP 🎓</h1>
            <h2 className="text-primary mb-4">Hệ thống quản lý kho hàng 📦</h2>
            <p className="text-black text-center">
              Quản lý thông tin sản phẩm, tồn kho, và xuất nhập kho hiệu quả với hệ thống mã vạch hiện đại.
            </p>
          </Row>
          <Row className='mb-3'>
            <img
              src="/img/barcode3.gif"
              alt="Barcode GIF"
              style={{ width: "150px", height: "auto" }}
            />
          </Row>
        </Col>
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Đăng Nhập</h2>
              <Form>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ position: 'relative' }}
                  />
                  <span onClick={() => setShowPassword((prev) => !prev)
                  } style={{
                    position: 'absolute',
                    right: '30px',
                    top: '51%',
                    cursor: 'pointer'
                  }
                  }>
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </span>
                </Form.Group>
                <Form.Group className="mb-3" controlId="rememberMe">
                  <Form.Check
                    type="checkbox"
                    label="Nhớ tài khoản"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                </Form.Group>
                <Button variant="primary" type="button" className="w-100" onClick={handleSubmit}>
                  {loading ? (
                    <>
                    <Spinner animation="border" size="sm" />
                    Đang Đăng Nhập...
                    </>
                  ) : (
                    'Đăng Nhập'
                  )}
                </Button>
              </Form>
              <div className="mt-3 text-center">
                <Button variant="link" onClick={() => setShowRecoveryModal(true)}>
                  Quên mật khẩu?
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Khôi Phục Mật Khẩu */}
      <Modal show={showRecoveryModal} onHide={() => setShowRecoveryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Khôi phục mật khẩu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="recoveryEmail">
            <Form.Label>Email khôi phục</Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập email của bạn"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRecoveryModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handlePasswordRecovery}>
            Gửi yêu cầu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LogIn;
