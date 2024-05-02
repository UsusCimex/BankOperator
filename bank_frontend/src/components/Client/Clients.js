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
    const savedQuery = sessionStorage.getItem('userClientQuery');
    const savedResults = sessionStorage.getItem('queryClientResults');
    const savedFilters = sessionStorage.getItem('filters');
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

  useEffect(() => {
    sessionStorage.setItem('userClientQuery', userClientQuery);
  }, [userClientQuery]);

  useEffect(() => {
    sessionStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem('queryClientResults', JSON.stringify(clients));
  }, [clients]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await getAllClients();
      setClients(data);
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
      setClients(filteredData);
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
      setClients(data);
      setError(null);
    } catch (error) {
      console.error("Не удалось выполнить SQL запрос:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="container">
      <h2>Клиенты</h2>
      {role === "ROLE_ADMIN" && (
        <form onSubmit={handleSubmitQuery} class="form-standard">
          <div class="form-input-group">
            <input type="text" value={baseQuery} disabled class="base-query-input form-input" />
            <input type="text" value={userClientQuery} onChange={(e) => setUserClientQuery(e.target.value)} placeholder="Например, WHERE 1 = 1" class="user-query-input form-input" />
            <button type="submit" class="form-button">Выполнить запрос</button>
          </div>
        </form>
      )}
      <form onSubmit={handleApplyFilters} class="filter-form">
        {Object.keys(filters).map(key => (
          <div key={key} class="form-input-group">
            {key !== 'creditStatus' && key !== 'hasCredit' && key !== 'isBlocked' && (
              <input
                type={key === 'birthDate' ? 'date' : 'text'}
                name={key}
                value={filters[key] || ''}
                placeholder={`Фильтр по ${key}`}
                onChange={handleFilterChange}
                class="form-input"
              />
            )}
            {key === 'creditStatus' && (
              <select name="creditStatus" value={filters[key] || ''} onChange={handleFilterChange} class="form-input">
                <option value="">Выберите статус кредита</option>
                <option value="Expired">Expired</option>
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            )}
            {key === 'hasCredit' && (
              <select name="hasCredit" value={filters[key]} onChange={handleFilterChange} class="form-input">
                <option value="">Выберите кредитный статус</option>
                <option value={true}>Есть</option>
                <option value={false}>Нет</option>
              </select>
            )}
            {key === 'isBlocked' && (
              <select name="isBlocked" value={filters[key]} onChange={handleFilterChange} class="form-input">
                <option value="">Выберите статус блокировки</option>
                <option value={true}>Заблокирован</option>
                <option value={false}>Не заблокирован</option>
              </select>
            )}
          </div>
        ))}
        <button type="submit" class="form-button">Применить фильтры</button>
      </form>
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && <button onClick={() => setModalOpen(true)} class="button button-primary">Добавить клиента</button>}
      {modalOpen && <AddClientModal onClose={() => setModalOpen(false)} onClientAdded={fetchClients} />}
      {loading && <div>Загрузка...</div>}
      {error && <div class="alert-danger">Ошибка: {error}</div>}
      <div class="list-container">
        {clients.map(client => (
          <div key={client.id} class="item-card" onClick={() => navigate(`/clients/${client.id}`)}>
            <p>Имя: {client.name}</p>
            <p>Email: {client.email}</p>
            <p>Телефон: {client.phone}</p>
            <p>Дата рождения: {client.birthDate && new Date(client.birthDate).toLocaleDateString()}</p>
            <p>Статус кредита: {client.creditStatus}</p>
            <p>Кредитный статус: {client.hasCredit ? "Есть" : "Нет"}</p>
            <p>Заблокирован: {client.isBlocked ? "Да" : "Нет"}</p>
          </div>
        ))}
      </div>
    </div>


  );
}

export default Clients;
