import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, updateClient, deleteClient } from '../services/ClientService';
import './ClientPage.css';

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
        <input className="input" name="name" value={client.name} onChange={handleChange} placeholder="Name" />
        <input className="input" name="contactInfo" value={client.contactInfo} onChange={handleChange} placeholder="Contact Info" />
        <input className="input" name="passportData" value={client.passportData} onChange={handleChange} placeholder="Passport Data" />
        <input className="input" type="date" name="birthDate" value={client.birthDate} onChange={handleChange} />
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