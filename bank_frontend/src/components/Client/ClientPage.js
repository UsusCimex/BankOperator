import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, updateClient, deleteClient } from '../../services/ClientService';
import '../Page.css';

function ClientPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState({ name: '', contactInfo: '', passportData: '', birthDate: '' });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClientById(clientId);
      setClient(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
      setError("Failed to fetch client details");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleUpdate = async () => {
    try {
      await updateClient(clientId, client);
      alert('Client updated successfully');
    } catch (error) {
      alert('Failed to update client');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteClient(clientId);
      alert('Client deleted successfully');
      navigate('/clients');
    } catch (error) {
      alert('Failed to delete client');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prevState => ({ ...prevState, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!client) return <div>No client data found.</div>;

  return (
    <div className="client-page">
      <h2 className="client-header">Client Details</h2>
      <div className="client-details">
        <label htmlFor="name">Name:</label>
        <input className="input" id="name" name="name" value={client.name} onChange={handleChange} placeholder="Name" />
        
        <label htmlFor="email">Email:</label>
        <input className="input" id="email" name="email" value={client.email} onChange={handleChange} placeholder="Email" />

        <label htmlFor="phone">Phone:</label>
        <input className="input" id="phone" name="phone" value={client.phone} onChange={handleChange} placeholder="Phone" />
        
        <label htmlFor="passportData">Passport Data:</label>
        <input className="input" id="passportData" name="passportData" value={client.passportData} onChange={handleChange} placeholder="Passport Data" />
        
        <label htmlFor="birthDate">Birth Date:</label>
        <input className="input" id="birthDate" type="date" name="birthDate" value={client.birthDate} onChange={handleChange} />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete User</button>
        <button className="button" onClick={() => alert('Adding payment...')}>Add Payment</button>
        <button className="button" onClick={() => alert('Selecting credit tariff...')}>Select Credit Tariff</button>
      </div>
    </div>
  );
}

export default ClientPage;
