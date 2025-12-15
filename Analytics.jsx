import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { analyticsAPI } from '../services/api';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const Analytics = () => {
  const [trends, setTrends] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [trendsRes, performanceRes] = await Promise.all([
        analyticsAPI.getTrends(),
        analyticsAPI.getPerformance()
      ]);
      setTrends(trendsRes.data.trends || []);
      setPerformance(performanceRes.data.performance || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  return (
    <Container fluid>
      <h2 className="mb-4 text-white">Analytics Dashboard</h2>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Price Trends (Last 30 Days)</Card.Title>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgPrice" 
                    stroke="#667eea" 
                    strokeWidth={2}
                    name="Average Price"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="minPrice" 
                    stroke="#48bb78" 
                    strokeWidth={2}
                    name="Minimum Price"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxPrice" 
                    stroke="#f56565" 
                    strokeWidth={2}
                    name="Maximum Price"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Product Performance</Card.Title>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" fill="#667eea" name="Views" />
                  <Bar dataKey="priceChecks" fill="#764ba2" name="Price Checks" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-primary">📊</h3>
              <h4>{trends.length}</h4>
              <p className="text-muted">Data Points</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-success">✅</h3>
              <h4>{performance.length}</h4>
              <p className="text-muted">Products Analyzed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <h3 className="text-warning">⚡</h3>
              <h4>Real-time</h4>
              <p className="text-muted">Updates Active</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;