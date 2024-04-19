import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientById, updateClient, deleteClient } from '../../services/ClientService';
import '../DetailEdit.css';

function ClientPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState({
    name: '',
    email: '',
    phone: '',
    passportData: '',
    birthDate: ''
  });
  const [status, setStatus] = useState({ loading: true, error: null });

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await getClientById(clientId);
        setClient(data);
        setStatus(prev => ({ ...prev, loading: false }));
      } catch (error) {
        console.error("Failed to fetch client details:", error);
        setStatus({ loading: false, error: error.message || "Failed to fetch client details" });
      }
    };

    fetchClient();
  }, [clientId]);

  const handleUpdate = async () => {
    try {
      await updateClient(clientId, client);
      alert('Client updated successfully');
      navigate('/clients'); // Navigate after successful update
    } catch (error) {
      console.error("Update error:", error);
      setStatus({ error: error.message || "Failed to update client" });
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this client?');
    if (confirmDelete) {
      try {
        await deleteClient(clientId);
        alert('Client deleted successfully');
        navigate('/clients'); // Redirect after deletion
      } catch (error) {
        console.error("Delete error:", error);
        setStatus({ error: error.message || "Failed to delete client" });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prevState => ({ ...prevState, [name]: value }));
  };

  const dismissError = () => {
    setStatus(prevStatus => ({ ...prevStatus, error: null }));
  };

  if (status.loading) return <div>Loading...</div>;
  if (!client) return <div>No client data found.</div>;

  return (
    <div className="detail-page client-page">
      {status.error && (
        <div className="alert alert-danger">
          <button onClick={dismissError} className="close" title="Close">
            &times;
          </button>
          {status.error}
        </div>
      )}

      <h2 className="detail-header">Client Details</h2>
      <div className="detail-details">
        <label htmlFor="name" className="label">Name:</label>
        <input className="input" id="name" name="name" value={client.name || ''} onChange={handleChange} placeholder="Name" />
        
        <label htmlFor="email" className="label">Email:</label>
        <input className="input" id="email" name="email" value={client.email || ''} onChange={handleChange} placeholder="Email" />

        <label htmlFor="phone" className="label">Phone:</label>
        <input className="input" id="phone" name="phone" value={client.phone || ''} onChange={handleChange} placeholder="Phone" />
        
        <label htmlFor="passportData" className="label">Passport Data:</label>
        <input className="input" id="passportData" name="passportData" value={client.passportData || ''} onChange={handleChange} placeholder="Passport Data" />
        
        <label htmlFor="birthDate" className="label">Birth Date:</label>
        <input className="input" id="birthDate" type="date" name="birthDate" value={client.birthDate || ''} onChange={handleChange} />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete User</button>
      </div>
    </div>
  );
}

export default ClientPage;
