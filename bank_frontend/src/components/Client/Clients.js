import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/ClientService';
import { AddClientModal } from './AddClientModal';
import '../ListView.css';

function Clients() {
  const [clients, setClients] = useState([]);
  const baseQuery = "SELECT * FROM client"; // используем константу, так как запрос не меняется
  const [userClientQuery, setUserClientQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userClientQuery');
    const savedResults = sessionStorage.getItem('queryClientResults');
    if (savedQuery) {
      setUserClientQuery(savedQuery);
    }
    if (savedResults) {
      setClients(JSON.parse(savedResults));
    }
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const fullQuery = `${baseQuery} ${userClientQuery}`;
      const data = await executeCustomQuery(fullQuery);
      console.log("Received data:", data);
      setClients(data || []);
      sessionStorage.setItem('queryClientResults', JSON.stringify(data || []));
      sessionStorage.setItem('userClientQuery', userClientQuery);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = (e) => {
    e.preventDefault();
    fetchClients();
  };

  const handleClientClick = clientId => {
    if (role === "ROLE_OPERATOR" || role === "ROLE_ADMIN")
      navigate(`/clients/${clientId}`);
  };

  const handleClientAdded = () => {
    fetchClients();
  };

  return (
    <div>
      <h2>Clients</h2>
      <form onSubmit={handleSubmitQuery} className="form-standard">
        <div className="form-input-group">
          <input type="text" value={baseQuery} disabled className="base-query-input form-input" />
          <input type="text" value={userClientQuery} onChange={(e) => setUserClientQuery(e.target.value)} placeholder="e.g., WHERE 1 = 1" className="user-query-input form-input" />
        </div>
        <small>You can use attributes like client_id, name, email, phone, passport_data, birth_date in your WHERE clause.</small>
        <button type="submit" className="form-button">Execute Query</button>
      </form>
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && <button onClick={() => setModalOpen(true)} className="button button-primary">Add Client</button>}
      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} onClientAdded={handleClientAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {clients.map(client => (
          <div key={client.id} className="item-card" onClick={() => handleClientClick(client.id)}>
            <p>Name: {client.name}</p>
            <p>Phone: {client.phone}</p>
            <p>Email: {client.email}</p>
            <p>Birth Date: {client.birthDate}</p>
          </div>
        ))}
      </div>
    </div>
  );  
}

export default Clients;
