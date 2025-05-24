
import React, { useState, useEffect } from "react";
import { Table, Spinner, Alert, Form, Button, Row, Col, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSort, faSortUp, faSortDown, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from 'react-toastify';

function Products() {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const productsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`, {
        withCredentials: true,
      });
      const categoriesRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/categories`, {
        withCredentials: true,
      });
      const suppliersRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/suppliers`, {
        withCredentials: true,
      });
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setSuppliers(suppliersRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  const handleEdit = (product) => {
    setEditingProductId(product.product_id);
    setEditedProduct({ ...product });
    setShowModal(true);
  };

  const handleDelete = async (product, res) => {
    console.log(`Xóa sản phẩm ID: ${product.product_id}`);
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${product.name}?`)) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/products/${product.product_id}`, {
          withCredentials: true,
        });
        // Cập nhật lại danh sách sản phẩm sau khi xóa
        setProducts((prev) => prev.filter(p => p.product_id !== product.product_id));
        fetchData();
        toast.success("Xóa sản phẩm thành công!");
      } catch (err) {
        console.error('hi tiết lỗi khi xóa sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm.' });
        toast.error("Xóa sản phẩm thất bại! Vui lòng thử lại sau.");
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/products/${editingProductId}`, editedProduct, {
        withCredentials: true,
      });

      // Cập nhật danh sách sản phẩm
      const updatedProducts = products.map((product) =>
        product.product_id === editingProductId ? { ...product, ...editedProduct } : product
      );

      setProducts(updatedProducts);
      setEditingProductId(null);
      setEditedProduct({});
      fetchData();
      toast.success("Cập nhật sản phẩm thành công!");
    } catch (error) {
      toast.error("Cập nhật sản phẩm thất bại! Vui lòng thử lại sau.");
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">Lỗi khi tải sản phẩm: {error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Quản lý sản phẩm</h1>
      <Form className="mb-3 d-flex justify-content-end align-items-center">
        <Form.Group controlId="searchBar" className="d-flex align-items-center">
          <Form.Control
            type="text"
            placeholder="Tìm kiếm tên sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "250px" }}
          />
        </Form.Group>
      </Form>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("barcode")}>
              Mã vạch <FontAwesomeIcon icon={getSortIcon("barcode")} />
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>
              Tên sản phẩm <FontAwesomeIcon icon={getSortIcon("name")} />
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("category_name")}>
              Danh mục <FontAwesomeIcon icon={getSortIcon("category_name")} />
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("quantity")}>
              Số lượng <FontAwesomeIcon icon={getSortIcon("quantity")} />
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("unit_price")}>
              Giá bán <FontAwesomeIcon icon={getSortIcon("unit_price")} />
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("production_date")}>
              Ngày sản xuất <FontAwesomeIcon icon={getSortIcon("production_date")} />
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("expiration_date")}>
              Hạn sử dụng <FontAwesomeIcon icon={getSortIcon("expiration_date")} />
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("supplier_name")}>
              Nhà cung cấp <FontAwesomeIcon icon={getSortIcon("supplier_name")} />
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products
            .filter((product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
              if (!sortConfig.key) return 0;
              const valA = typeof a[sortConfig.key] === "string" ? a[sortConfig.key].toLowerCase() : a[sortConfig.key];
              const valB = typeof b[sortConfig.key] === "string" ? b[sortConfig.key].toLowerCase() : b[sortConfig.key];

              if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
              if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
              return 0;
            })
            .map((product) => (
              <tr key={product.product_id}>
                <td>{product.barcode}</td>
                <td>{product.name}</td>
                <td>{product.category_name}</td>
                <td>{product.quantity}</td>
                <td>
                  {product.unit_price != null
                    ? product.unit_price.toLocaleString("vi-VN") + " VND"
                    : ""}
                </td>
                <td>
                  {product.production_date
                    ? new Date(product.production_date).toLocaleDateString("vi-VN")
                    : ""}
                </td>
                <td>
                  {product.expiration_date
                    ? new Date(product.expiration_date).toLocaleDateString("vi-VN")
                    : ""}
                </td>
                <td>{product.supplier_name}</td>
                <td className="text-center">
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(product)}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Sửa
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(product)}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Xóa
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã vạch</Form.Label>
                  <Form.Control
                    name="barcode"
                    value={editedProduct.barcode || ""}
                    onChange={handleChange}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên sản phẩm</Form.Label>
                  <Form.Control
                    name="name"
                    value={editedProduct.name || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    name="category_id"
                    value={editedProduct.category_id || ""}
                    onChange={handleChange}>
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhà cung cấp</Form.Label>
                  <Form.Select
                    name="supplier_id"
                    value={editedProduct.supplier_id || ""}
                    onChange={handleChange}>
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.supplier_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Giá bán</Form.Label>
              <Form.Control
                name="unit_price"
                type="number"
                value={editedProduct.unit_price || ""}
                onChange={handleChange}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày sản xuất</Form.Label>
                  <Form.Control
                    name="production_date"
                    type="date"
                    value={editedProduct.production_date?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hạn sử dụng</Form.Label>
                  <Form.Control
                    name="expiration_date"
                    type="date"
                    value={editedProduct.expiration_date?.split("T")[0] || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowModal(false); setEditedProduct({}); }}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => { handleSaveEdit(); setShowModal(false); }}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default Products;