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
      <h2>Клиенты</h2>
      {role === "ROLE_ADMIN" && (
        <form onSubmit={handleSubmitQuery} className="form-standard">
           <div className="form-input-group">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input form-input" />
          <input 
            type="text" 
            value={userClientQuery} 
            onChange={(e) => setUserClientQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1" 
            className="user-query-input form-input" />
        </div>
        <small>You can use attributes like client_id, name, email, phone, passport_data, birth_date in your WHERE clause.</small>
        <button type="submit" className="form-button">Выполнить запрос</button>
        </form>
      )}
      <form onSubmit={handleApplyFilters} className="filter-form">
        {Object.keys(filters).map(key => (
          <div key={key} className="form-input-group">
            {key !== 'creditStatus' && key !== 'hasCredit' && key !== 'isBlocked' && (
              <input
                type={key === 'birthDate' ? 'date' : 'text'}
                name={key}
                value={filters[key] || ''}
                placeholder={`Фильтр по ${key}`}
                onChange={handleFilterChange}
                className="form-input"
              />
            )}
            {key === 'creditStatus' && (
              <select name="creditStatus" value={filters[key] || ''} onChange={handleFilterChange} className="form-input">
                <option value="">Выберите статус кредита</option>
                <option value="Expired">Expired</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            )}
            {key === 'hasCredit' && (
              <select name="hasCredit" value={filters[key]} onChange={handleFilterChange} className="form-input">
                <option value="">Выберите кредитный статус</option>
                <option value={true}>Есть</option>
                <option value={false}>Нет</option>
              </select>
            )}
            {key === 'isBlocked' && (
              <select name="isBlocked" value={filters[key]} onChange={handleFilterChange} className="form-input">
                <option value="">Выберите статус блокировки</option>
                <option value={true}>Заблокирован</option>
                <option value={false}>Не заблокирован</option>
              </select>
            )}
          </div>
        ))}
        <button type="submit" className="form-button">Применить фильтры</button>
      </form>
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && <button onClick={() => setModalOpen(true)} className="button button-primary">Добавить клиента</button>}
      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} onClientAdded={fetchClients} />}
      {loading && <div>Загрузка...</div>}
      {error && <div className="alert-danger">Ошибка: {error}</div>}
      <div className="list-container">
        {clients.map(client => (
          <div key={client.id} className="item-card" onClick={() => navigate(`/clients/${client.id}`)}>
            <p>Имя: {client.name}</p>
            <p>Email: {client.email}</p>
            <p>Телефон: {client.phone}</p>
            <p>Дата рождения: {client.birthDate && new Date(client.birthDate).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clients;
