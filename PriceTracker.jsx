import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Modal, Badge } from 'react-bootstrap';
import { productsAPI } from '../services/api';

const PriceTracker = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    url: '',
    platform: 'Amazon',
    targetPrice: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.create(newProduct);
      setShowModal(false);
      setNewProduct({ name: '', url: '', platform: 'Amazon', targetPrice: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-white">Price Tracker</h2>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + Add Product
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Platform</th>
                    <th>Current Price</th>
                    <th>Target Price</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No products tracked yet. Add your first product!
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id}>
                        <td>{product.name}</td>
                        <td>
                          <Badge bg="info">{product.platform}</Badge>
                        </td>
                        <td><strong>${product.currentPrice}</strong></td>
                        <td>${product.targetPrice || 'N/A'}</td>
                        <td>
                          {product.targetPrice && product.currentPrice <= product.targetPrice ? (
                            <Badge bg="success">Target Met!</Badge>
                          ) : (
                            <Badge bg="secondary">Tracking</Badge>
                          )}
                        </td>
                        <td>{new Date(product.lastChecked).toLocaleDateString()}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product URL</Form.Label>
              <Form.Control
                type="url"
                name="url"
                value={newProduct.url}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Platform</Form.Label>
              <Form.Select
                name="platform"
                value={newProduct.platform}
                onChange={handleInputChange}
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="eBay">eBay</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Price (Optional)</Form.Label>
              <Form.Control
                type="number"
                name="targetPrice"
                value={newProduct.targetPrice}
                onChange={handleInputChange}
                step="0.01"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Product
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PriceTracker;