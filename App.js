import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PriceTracker from './components/PriceTracker';
import Analytics from './components/Analytics';
import SearchProduct from './components/SearchProduct';
import { isAuthenticated } from './services/auth';

function App() {
  const [auth, setAuth] = useState(isAuthenticated());

  useEffect(() => {
    setAuth(isAuthenticated());
  }, []);

  const PrivateRoute = ({ children }) => {
    return auth ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="App">
        {auth && <Navbar setAuth={setAuth} />}
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/tracker" 
            element={
              <PrivateRoute>
                <PriceTracker />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/search"
            element={
              <PrivateRoute>
                <SearchProduct />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;