import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { analyticsAPI, productsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overviewRes, productsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        productsAPI.getAll()
      ]);
      setOverview(overviewRes.data);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  const chartData = products.slice(0, 5).map(p => ({
    name: p.name.substring(0, 15),
    price: p.currentPrice
  }));

  return (
    <Container fluid>
      <h2 className="mb-4 text-white">Dashboard Overview</h2>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card text-center">
            <div className="stat-icon">📦</div>
            <h3>{overview?.totalProducts || 0}</h3>
            <p className="text-muted">Total Products</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <div className="stat-icon">📈</div>
            <h3>{overview?.trackedProducts || 0}</h3>
            <p className="text-muted">Tracked Products</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <div className="stat-icon">💰</div>
            <h3>${overview?.avgPrice?.toFixed(2) || '0.00'}</h3>
            <p className="text-muted">Average Price</p>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card text-center">
            <div className="stat-icon">🔥</div>
            <h3>{overview?.priceAlerts || 0}</h3>
            <p className="text-muted">Price Alerts</p>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Product Price Overview</Card.Title>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#667eea" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Recent Products</Card.Title>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {products.slice(0, 5).map((product) => (
                  <div key={product._id} className="mb-3 p-2 border-bottom">
                    <strong>{product.name}</strong>
                    <br />
                    <small className="text-muted">{product.platform}</small>
                    <br />
                    <span className="badge bg-success">${product.currentPrice}</span>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;