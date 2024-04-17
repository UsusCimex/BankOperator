import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/ClientService';
import { AddClientModal } from './AddClientModal'
import '../SharedStyle.css';

function Clients() {
  const [clients, setClients] = useState([]);
  const [baseQuery] = useState("SELECT * FROM client");
  const [userClientQuery, setuserClientQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userClientQuery');
    const savedResults = sessionStorage.getItem('queryClientResults');
    if (savedQuery) setuserClientQuery(savedQuery);
    if (savedResults) setClients(JSON.parse(savedResults));
  }, []);

  const fetchClients = async (customQuery) => {
    setLoading(true);
    try {
      const data = await executeCustomQuery(customQuery);
      console.log("Received data:", data);
      setClients(data || []);
      sessionStorage.setItem('queryClientResults', JSON.stringify(data || []));
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
    const fullQuery = `${baseQuery} ${userClientQuery}`;
    fetchClients(fullQuery);
    sessionStorage.setItem('userClientQuery', userClientQuery);
  };

  const handleClientClick = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  const handleClientAdded = () => {
    fetchClients(`${baseQuery} ${userClientQuery}`);
  };

  return (
    <div>
      <h2>Clients</h2>
      <form onSubmit={handleSubmitQuery} className="query-form">
        <div className="query-inputs">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input"
          />
          <input 
            type="text" 
            value={userClientQuery} 
            onChange={(e) => setuserClientQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input"
          />
        </div>
        <small>You can use attributes like client_id, name, email, phone, passport_data, birth_date in your WHERE clause.</small>
        <button type="submit">Execute Query</button>
      </form>
      <button onClick={() => setModalOpen(true)} className="add-element-btn">Add Client</button>
      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} onClientAdded={handleClientAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      <div className="element-list">
        {clients && clients.map(client => (
          <div key={client.id} className="element-card" onClick={() => handleClientClick(client.id)}>
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