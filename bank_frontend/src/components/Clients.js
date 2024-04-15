import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery, createClient } from '../services/ClientService';
import './Clients.css';

function AddClientModal({ onClose, onClientAdded }) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const clientData = {
      name: formData.get('name'),
      contactInfo: formData.get('contactInfo'),
      passportData: formData.get('passportData'),
      birthDate: formData.get('birthDate'),
    };
    
    try {
      await saveClient(clientData);
      onClientAdded();
      onClose();
    } catch (error) {
      console.error('Failed to save client:', error);
    }
  };

  const saveClient = async (clientData) => {
    await createClient(clientData);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Client</h2>
        <form onSubmit={handleSubmit}>
          <div className="client-form">
            <input type="text" name="name" placeholder="Name" required />
            <input type="text" name="contactInfo" placeholder="Contact Info" required />
            <input type="text" name="passportData" placeholder="Passport Data" required />
            <input type="date" name="birthDate" placeholder="Birth Date" required />
            <button type="submit">Add Client</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Clients() {
  const [clients, setClients] = useState([]);
  const [baseQuery] = useState("SELECT * FROM client");
  const [userQuery, setUserQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userQuery');
    const savedResults = sessionStorage.getItem('queryResults');
    if (savedQuery) setUserQuery(savedQuery);
    if (savedResults) setClients(JSON.parse(savedResults));
  }, []);

  const fetchClients = async (customQuery) => {
    setLoading(true);
    try {
      const data = await executeCustomQuery(customQuery);
      console.log("Received data:", data);
      setClients(data || []);
      sessionStorage.setItem('queryResults', JSON.stringify(data || []));
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
    const fullQuery = `${baseQuery} ${userQuery}`;
    fetchClients(fullQuery);
    sessionStorage.setItem('userQuery', userQuery);
  };

  const handleClientClick = (clientId) => {
    navigate(`/clients/${clientId}`);
  };

  const handleClientAdded = () => {
    fetchClients(`${baseQuery} ${userQuery}`);
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
            value={userQuery} 
            onChange={(e) => setUserQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input"
          />
        </div>
        <small>You can use attributes like client_id, name, contact_info, passport_data, birth_date in your WHERE clause.</small>
        <button type="submit">Execute Query</button>
      </form>
      <button onClick={() => setModalOpen(true)} className="add-client-btn">Add Client</button>
      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} onClientAdded={handleClientAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      <div className="client-list">
        {clients && clients.map(client => (
          <div key={client.id} className="client-card" onClick={() => handleClientClick(client.id)}>
            <p>Name: {client.name}</p>
            <p>Passport Data: {client.passportData}</p>
            <p>Birth Date: {client.birthDate}</p>
          </div>
        ))}
      </div>
    </div>
  );  
}

export default Clients;