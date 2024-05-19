import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Clients from './components/Client/Clients';
import Credits from './components/Credit/Credits';
import Payments from './components/Payment/Payments';
import Tariffs from './components/Tariff/Tariffs';
import Report from './components/Report/Report';
import Home from './components/Home';
import './App.css';
import ClientPage from './components/Client/ClientPage';
import CreditPage from './components/Credit/CreditPage';
import TariffPage from './components/Tariff/TariffPage';
import QueryPage from './components/CustomQuery/QueryPage';
import PaymentPage from './components/Payment/PaymentPage';
import PrivateRoute from './authorization/PrivateRoute';
import api from './authorization/AxiosApi';
import ResetPasswordForm from './authorization/ResetPasswordForm'

import { Button } from '@mui/material';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const role = sessionStorage.getItem('role');

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/validate-token');
      console.log(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Token validation failed', error);
      setIsAuthenticated(false);
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
    }
  }, [isAuthenticated])

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 50);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  const handleLogin = (token, role) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          {isAuthenticated && 
            <Button className="query-modal-btn-container Button" onClick={handleLogout}>Logout</Button>
          }
          <div className="nav-links-container">
            <div className="nav-links">
              <NavLink className="nav-link" to="/" end>Home</NavLink>
              <NavLink className="nav-link" to="/clients">Clients</NavLink>
              <NavLink className="nav-link" to="/credits">Credits</NavLink>
              <NavLink className="nav-link" to="/payments">Payments</NavLink>
              <NavLink className="nav-link" to="/tariffs">Tariffs</NavLink>
              {(role === 'ROLE_ACCOUNTANT' || role === 'ROLE_ADMIN') &&
                <NavLink className="nav-link" to="/report">Report</NavLink>
              }
            </div>
          </div>
          {role === 'ROLE_ADMIN' && 
            <NavLink className="nav-link" to="/query">SQL Query</NavLink>
          }
        </nav>
        <div className="content">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} onLogin={handleLogin} />} />
            <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:clientId" element={<ClientPage />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/credits/:creditId" element={<CreditPage />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:paymentId" element={<PaymentPage />} />
              <Route path="/tariffs" element={<Tariffs />} />
              <Route path="/tariffs/:tariffId" element={<TariffPage />} />
              <Route path="/report" element={<Report />} />
              <Route path="/query" element={<QueryPage />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
