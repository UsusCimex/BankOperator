import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClientById, updateClient, deleteClient, blockClient, unblockClient } from '../../services/ClientService';
import { getClientCredits } from '../../services/CreditService';
import { AddCreditModal } from '../Credit/AddCreditModal';
import '../DetailEdit.css';
import '../History.css';

// Компонент для отображения и управления деталями клиента
function ClientPage() {
  const { clientId } = useParams(); // Получение ID клиента из URL
  const navigate = useNavigate();
  const [client, setClient] = useState({
    name: '', email: '', phone: '', passportData: '', birthDate: '', isBlocked: false, blockUntil: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [credits, setCredits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загрузка данных клиента и его кредитов при монтировании
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const clientData = await getClientById(clientId);
      const creditsData = await getClientCredits(clientId);
      setClient(clientData);
      setCredits(creditsData);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
      setError(`Failed to fetch client details\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 50);

    return () => clearTimeout(timer);
  }, [fetchData]);

  // Обновление информации о кредитах
  const refreshCredits = async () => {
    try {
      const creditsData = await getClientCredits(clientId);
      setCredits(creditsData);
    } catch (error) {
      console.error("Failed to refresh credits:", error);
      setError(`Failed to refresh credits\nError: ${error.message}`);
    }
  };

  // Добавление нового кредита
  const handleAddCredit = () => {
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Обновление данных клиента
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateClient(clientId, client);
      alert('Client updated successfully');
      navigate('/clients');
    } catch (error) {
      console.error("Update error:", error);
      setError(`Failed to update client\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Удаление клиента
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this client?');
    if (confirmDelete) {
      setLoading(true);
      try {
        await deleteClient(clientId);
        alert('Client deleted successfully');
        navigate('/clients');
      } catch (error) {
        console.error("Delete error:", error);
        setError(`Failed to delete client\nError: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Обработка изменений в полях ввода
  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prevState => ({ ...prevState, [name]: value }));
  };

  // Обработка блокировки клиента
  const handleBlock = async () => {
    setLoading(true);
    try {
      await blockClient(clientId, client.blockUntil);
      setClient(prevState => ({ ...prevState, isBlocked: true }));
      alert('Client blocked until ' + client.blockUntil);
    } catch (error) {
      console.error("Block error:", error);
      setError(`Failed to block client\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Обработка разблокировки клиента
  const handleUnblock = async () => {
    setLoading(true);
    try {
      await unblockClient(clientId);
      setClient(prevState => ({ ...prevState, isBlocked: false, blockUntil: '' }));
      alert('Client unblocked');
    } catch (error) {
      console.error("Unblock error:", error);
      setError(`Failed to unblock client\nError: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Сброс ошибок
  const dismissError = () => {
    setError(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!client) return <div>No client data found.</div>;

  return (
    <div className="detail-page client-page">
      {error && (
        <div className="alert alert-danger">
          <button onClick={dismissError} className="close" title="Close">
            &times;
          </button>
          {error}
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
        <input className="input" id="birthDate" type="date" name="birthDate" value={client.birthDate.split('T')[0] || ''} onChange={handleChange} />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete User</button>
        <button className="button" onClick={handleAddCredit}>Add Credit</button>
      </div>
      <div className="buttons blockage-div">
        {client.isBlocked ? (
          <>
            <input type="datetime-local" name="blockUntil" value={client.blockEndDate.slice(0, 16)} onChange={handleChange} disabled className="input-date-blockage" />
            <button className="blockage-button" onClick={handleUnblock}>Unblock Client</button>
          </>
        ) : (
          <>
            <input type="datetime-local" name="blockUntil" value={client.blockEndDate?.slice(0, 16)} onChange={handleChange} className="input-date-blockage" />
            <button className="blockage-button" onClick={handleBlock}>Block until date</button>
          </>
        )}
      </div>

      {isModalOpen && <AddCreditModal onClose={handleCloseModal} onCreditAdded={refreshCredits} currentClient={{ value: client.id, label: client.name }}/>}
      <h3>Credit History</h3>
      <div className="history">
        {credits.map(credit => (
          <Link to={`/credits/${credit.id}`} key={`credit${credit.id}`} className="history-button">
            <div className="history-content">
              <strong>Tariff: {credit.tariffName}</strong>
              <div>Amount: {credit.amount}</div>
              <div>Status: {credit.status}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ClientPage;
