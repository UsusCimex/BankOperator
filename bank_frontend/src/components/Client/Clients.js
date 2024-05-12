import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { getAllClients, getClientsWithFilters, executeCustomQuery } from '../../services/ClientService';
import { AddClientModal } from './AddClientModal';
import '../ListView.css';

// Основной компонент для управления клиентами
function Clients() {
  // Состояния компонента
  const [clients, setClients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '', email: '', phone: '', passport: '', birthDate: '',
    creditStatus: '', hasCredit: '', isBlocked: ''
  });
  const baseQuery = "SELECT * FROM client";
  const [userClientQuery, setUserClientQuery] = useState("");
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');
  const [currentPage, setCurrentPage] = useState(parseInt(sessionStorage.getItem('clientCurrentPage')) || 0);
  const [pageCount, setPageCount] = useState(parseInt(sessionStorage.getItem('clientPageCount')) || 0);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllClients(currentPage);
      setClients(data.content);
      setPageCount(data.totalPages);
      sessionStorage.setItem('clientCurrentPage', data.currentPage);
      sessionStorage.setItem('clientPageCount', data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Не удалось получить клиентов:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadDataWithFilters = useCallback(async () => {
    setLoading(true);
    try {
      const savedFilters = sessionStorage.getItem('clientFilters');
      if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          const filteredData = await getClientsWithFilters(currentPage, parsedFilters);
          setClients(filteredData.content);
          setPageCount(filteredData.totalPages);
          sessionStorage.setItem('clientCurrentPage', currentPage.toString());
          sessionStorage.setItem('clientPageCount', pageCount.toString());
          sessionStorage.setItem('clientLastQueryType', 'filter');
      }
      setError(null);
    } catch (error) {
      console.error("Не удалось отфильтровать клиентов:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageCount]);

  const executeSqlQuery = useCallback(async () => {
    setLoading(true);
    try {
      const query = sessionStorage.getItem('clientsQuery');
      const fullQuery = `${baseQuery} ${query}`;
      const data = await executeCustomQuery(fullQuery);
      setClients(data);
      setPageCount(0);
      setCurrentPage(0);
      sessionStorage.setItem('clientCurrentPage', '0');
      sessionStorage.setItem('clientPageCount', '0');
      sessionStorage.setItem('clientLastQueryType', 'sql');
      
      setError(null);
    } catch (error) {
      console.error("Не удалось выполнить SQL запрос:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [baseQuery]);

  const fetchData = useCallback(() => {
    const savedQuery = sessionStorage.getItem('clientsQuery');
    if (savedQuery) setUserClientQuery(savedQuery);

    const savedFilters = sessionStorage.getItem('clientFilters');
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(filters => ({...filters, ...parsedFilters}));
    }

    const lastQueryType = sessionStorage.getItem('clientLastQueryType');
    if (lastQueryType === 'filter') {
      loadDataWithFilters(); // Применяем фильтры если последний тип был фильтрация
    } else if (lastQueryType === 'sql'){
      executeSqlQuery(); // Выполняем SQL запрос если последний тип был SQL
    } else {
      fetchClients();
    }
  }, [executeSqlQuery, fetchClients, loadDataWithFilters]);

  // Загрузка сохраненных данных из sessionStorage при монтировании
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 50);

    return () => clearTimeout(timer);
  }, [fetchData]);

  // Обработчик изменений фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value || '' }));
  };
  
  // Обработка поиска с фильтрами
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    sessionStorage.setItem('clientFilters', JSON.stringify(filters));
    loadDataWithFilters();
  };
  
  // Обработка исполнения запроса
  const handleSubmitQuery = (e) => {
    e.preventDefault();
    sessionStorage.setItem('clientsQuery', userClientQuery);
    executeSqlQuery();
  };  

  // Обработка смены страниц
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className="container">
      <h2>Clients</h2>
      {role === "ROLE_ADMIN" && (
        <form onSubmit={handleSubmitQuery} className="form-standard">
          <div className="form-query-group">
            <input type="text" value={baseQuery} disabled className="base-query-input" />
            <input type="text" value={userClientQuery} onChange={(e) => setUserClientQuery(e.target.value)}
              placeholder="e.g., WHERE 1 = 1" className="user-query-input" />
          </div>
          <small>You can use attributes like id, name, email, phone, passportData, birthDate in your WHERE clause.</small>
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
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && 
        <button onClick={() => setModalOpen(true)} className="add-button">Add Client</button>
      }
      {modalOpen && 
        <AddClientModal 
          onClose={() => {
            setModalOpen(false);
            setCurrentPage(0);
            }} 
          onClientAdded={() => setPageCount(0)} />
      }
      {loading && 
        <div>Loading...</div>
      }
      {error && 
        <div className="alert-danger">Error: {error}</div>
      }
      <div className="list-container">
      {Array.isArray(clients) && 
        clients.map(client => (
        <div
          key={client.id}
          className={`item-card ${client.isBlocked ? 'blocked' : ''}`}
          onClick={() => navigate(`/clients/${client.id}`)}
        >
          <p>Name: {client.name}</p>
          <p>Email: {client.email}</p>
          <p>Phone: {client.phone}</p>
          <p>Birth Date: {client.birthDate && new Date(client.birthDate).toLocaleDateString()}</p>
          <p>Credit Status: {client.creditStatus}</p>
        </div>
      ))}
      </div>
      {pageCount !== 0 &&
        <ReactPaginate
          previousLabel={'previous'}
          nextLabel={'next'}
          breakLabel={'...'}
          pageCount={pageCount}
          onPageChange={handlePageClick}
          containerClassName={'pagination'}
          activeClassName={'active'}
          forcePage={currentPage}
        />
      }
    </div>
  );
}

export default Clients;
