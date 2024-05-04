import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Clients from './components/Client/Clients';
import Credits from './components/Credit/Credits';
import Payments from './components/Payment/Payments';
import Tariffs from './components/Tariff/Tariffs';
import Home from './components/Home';
import './App.css';
import ClientPage from './components/Client/ClientPage';
import CreditPage from './components/Credit/CreditPage';
import TariffPage from './components/Tariff/TariffPage';
import PaymentPage from './components/Payment/PaymentPage';
import { executeCustomQuery } from './services/CustomQueryService';
import PrivateRoute from './authorization/PrivateRoute';
import api from './authorization/AxiosApi';

import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';

function QueryModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const result = await executeCustomQuery(query);
          console.log(result);
      } catch (error) {
          console.error("Error:", error);
      }
      onClose();
  };
  
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your query here"
          />
          <button type="submit">Execute Query</button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [isQueryModalOpen, setQueryModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const role = sessionStorage.getItem('role');

  useEffect(() => {
    const timer = setTimeout(() => {
      const checkAuth = async () => {
        try {
          const response = await api.get('/validate-token');
          console.log(response.data);
          !isAuthenticated && setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed', error);
          isAuthenticated && setIsAuthenticated(false);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('role');
        }
      };
      !isAuthenticated && checkAuth();
    }, 50);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleLogin = (token, role) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', role);
    isAuthenticated && setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    !isAuthenticated && setIsAuthenticated(false);
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
            </div>
          </div>
          {role === 'ROLE_ADMIN' && 
          <div className="query-modal-btn-container">
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => setQueryModalOpen(true)}
              className="query-modal-btn"
            > SQL Query
            </Button>
          </div>
          }
        </nav>
        <QueryModal isOpen={isQueryModalOpen} onClose={() => setQueryModalOpen(false)} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} onLogin={handleLogin} />} />
            <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:clientId" element={<ClientPage />} />
              <Route path="/credits" element={<Credits />} />
              <Route path="/credits/:creditId" element={<CreditPage />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:paymentId" element={<PaymentPage />} />
              <Route path="/tariffs" element={<Tariffs />} />
              <Route path="/tariffs/:tariffId" element={<TariffPage />} />
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
