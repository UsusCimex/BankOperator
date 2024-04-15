import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Clients from './components/Clients';
import Credits from './components/Credits';
import Payments from './components/Payments';
import Tariffs from './components/Tariffs';
import Home from './components/Home';
import './App.css';
import ClientPage from './components/ClientPage';

import Button from '@mui/material/Button';
import CreateIcon from '@mui/icons-material/Create';

function QueryModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with query:", query);
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

  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-links-container">
            <div className="nav-links">
              <NavLink className="nav-link" to="/" end>Home</NavLink>
              <NavLink className="nav-link" to="/clients">Clients</NavLink>
              <NavLink className="nav-link" to="/credits">Credits</NavLink>
              <NavLink className="nav-link" to="/payments">Payments</NavLink>
              <NavLink className="nav-link" to="/tariffs">Tariffs</NavLink>
            </div>
          </div>
          <div className="query-modal-btn-container">
            <Button
              variant="contained"
              startIcon={<CreateIcon />}
              onClick={() => setQueryModalOpen(true)}
              className="query-modal-btn"
            > SQL Query
            </Button>
          </div>
        </nav>
        <QueryModal isOpen={isQueryModalOpen} onClose={() => setQueryModalOpen(false)} />
        <div className="content">
          <Routes>
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:clientId" element={<ClientPage />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/tariffs" element={<Tariffs />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App;