import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClients, getClientsWithFilters, executeCustomQuery } from '../../services/ClientService';
import { AddClientModal } from './AddClientModal';
import '../ListView.css';

function Clients() {
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    passport: '',
    birthDate: '',
    creditStatus: '',
    hasCredit: '',
    isBlocked: ''
  });
  const baseQuery = "SELECT * FROM client";
  const [userClientQuery, setUserClientQuery] = useState("");
  const role = sessionStorage.getItem('role');

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('clientsQuery');
    const savedResults = sessionStorage.getItem('clientsResults');
    const savedFilters = sessionStorage.getItem('clientFilters');
    if (savedQuery) {
      setUserClientQuery(savedQuery);
    }
    if (savedResults) {
      setClients(JSON.parse(savedResults));
    }
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await getAllClients();
      setClients(data);
      sessionStorage.setItem('clientsResults', JSON.stringify(data));
      setError(null);
    } catch (error) {
      console.error("Не удалось получить клиентов:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value !== '' ? value : undefined
    }));
  };

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filteredData = await getClientsWithFilters(filters);
      sessionStorage.setItem('clientFilters', JSON.stringify(filters));
      setClients(filteredData);
      sessionStorage.setItem('clientsResults', JSON.stringify(filteredData));
      setError(null);
    } catch (error) {
      console.error("Не удалось отфильтровать клиентов:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullQuery = `${baseQuery} ${userClientQuery}`;
      const data = await executeCustomQuery(fullQuery);
      sessionStorage.setItem('clientsQuery', userClientQuery);
      setClients(data);
      sessionStorage.setItem('clientsResults', JSON.stringify(data));
      setError(null);
    } catch (error) {
      console.error("Не удалось выполнить SQL запрос:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Clients</h2>
      {role === "ROLE_ADMIN" && (
        <form onSubmit={handleSubmitQuery} className="form-standard">
          <div className="form-query-group">
            <input 
              type="text" 
              value={baseQuery} 
              disabled 
              className="base-query-input" />
            <input 
              type="text" 
              value={userClientQuery} 
              onChange={(e) => setUserClientQuery(e.target.value)} 
              placeholder="e.g., WHERE 1 = 1" 
              className="user-query-input" />
          </div>
          <small>You can use attributes like client_id, name, email, phone, passport_data, birth_date in your WHERE clause.</small>
          <button type="submit" className="execute-query-button">Execute Query</button>
        </form>
      )}
      <form onSubmit={handleApplyFilters} className="filter-form">
        <div className="form-container">
          <div className="form-input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={filters.name}
              placeholder="Enter name"
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="text"
              id="email"
              name="email"
              value={filters.email}
              placeholder="Enter email"
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={filters.phone}
              placeholder="Enter phone"
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="passport">Passport</label>
            <input
              type="text"
              id="passport"
              name="passport"
              value={filters.passport}
              placeholder="Enter passport number"
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="birthDate">Birth Date</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={filters.birthDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="creditStatus">Credit Status</label>
            <select id="creditStatus" name="creditStatus" value={filters.creditStatus || ''} onChange={handleFilterChange} className="form-input">
              <option value="">Select status</option>
              <option value="Expired">Expired</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="form-input-group">
            <label htmlFor="hasCredit">Has Credit?</label>
            <select id="hasCredit" name="hasCredit" value={filters.hasCredit} onChange={handleFilterChange} className="form-input">
              <option value="">Select option</option>
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>
          <div className="form-input-group">
            <label htmlFor="isBlocked">Is Blocked?</label>
            <select id="isBlocked" name="isBlocked" value={filters.isBlocked} onChange={handleFilterChange} className="form-input">
              <option value="">Select option</option>
              <option value={true}>Yes</option>
              <option value={false}>No</option>
            </select>
          </div>
        </div>
        <button type="submit" className="form-button">Search</button>
      </form>
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && (
        <div className="button-group">
          <button onClick={() => setModalOpen(true)} className="add-button">Add Client</button>
        </div>
      )}
      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} onClientAdded={fetchClients} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {clients.map(client => (
          <div key={client.id} className="item-card" onClick={() => navigate(`/clients/${client.id}`)}>
            <p>Name: {client.name}</p>
            <p>Email: {client.email}</p>
            <p>Phone: {client.phone}</p>
            <p>Birth Date: {client.birthDate && new Date(client.birthDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clients;
