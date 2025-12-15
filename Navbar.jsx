import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { removeToken, getUserInfo } from '../services/auth';

const Navbar = ({ setAuth }) => {
  const navigate = useNavigate();
  const user = getUserInfo();

  const handleLogout = () => {
    removeToken();
    setAuth(false);
    navigate('/login');
  };

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          <strong>📊 MarketHub</strong>
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/tracker">Price Tracker</Nav.Link>
            <Nav.Link as={Link} to="/analytics">Analytics</Nav.Link>
            <Nav.Link as={Link} to="/search">Search Product</Nav.Link>
          </Nav>
          <Nav>
            <BSNavbar.Text className="me-3">
              Welcome, <strong>{user?.email}</strong>
            </BSNavbar.Text>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;