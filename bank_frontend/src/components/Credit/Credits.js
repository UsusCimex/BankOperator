import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { executeCustomQuery, getAllCredits, getCreditsWithFilters } from '../../services/CreditService';
import { AddCreditModal } from './AddCreditModal';
import '../ListView.css';

function Credits() {
  const [credits, setCredits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    clientName: '', tariffName: '', amount: '', status: '', startDate: '', endDate: ''
  });
  const baseQuery = "SELECT * FROM credit";
  const [userCreditQuery, setUserCreditQuery] = useState("");
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');
  const [currentPage, setCurrentPage] = useState(parseInt(sessionStorage.getItem('creditCurrentPage')) || 0);
  const [pageCount, setPageCount] = useState(parseInt(sessionStorage.getItem('creditPageCount')) || 0);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCredits(currentPage);
      setCredits(data.content);
      setPageCount(data.totalPages);
      sessionStorage.setItem('creditCurrentPage', data.currentPage);
      sessionStorage.setItem('creditPageCount', data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Не удалось получить кредиты:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadDataWithFilters = useCallback(async () => {
    setLoading(true);
    try {
      const savedFilters = sessionStorage.getItem('creditFilters');
      if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          const filteredData = await getCreditsWithFilters(currentPage, parsedFilters);
          setCredits(filteredData.content);
          setPageCount(filteredData.totalPages);
          sessionStorage.setItem('creditCurrentPage', currentPage.toString());
          sessionStorage.setItem('creditPageCount', pageCount.toString());
          sessionStorage.setItem('creditLastQueryType', 'filter');
      }
      setError(null);
    } catch (error) {
      console.error("Не удалось отфильтровать кредиты:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageCount]);

  const executeSqlQuery = useCallback(async () => {
    setLoading(true);
    try {
      const query = sessionStorage.getItem('creditQuery');
      const fullQuery = `${baseQuery} ${query}`;
      const data = await executeCustomQuery(fullQuery);
      setCredits(data);
      setPageCount(0);
      setCurrentPage(0);
      sessionStorage.setItem('creditCurrentPage', '0');
      sessionStorage.setItem('creditPageCount', '0');
      sessionStorage.setItem('creditLastQueryType', 'sql');

      setError(null);
    } catch (error) {
      console.error("Не удалось выполнить SQL запрос:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [baseQuery]);

  // Загрузка сохраненных данных из sessionStorage при монтировании
  useEffect(() => {
    const savedQuery = sessionStorage.getItem('creditQuery');
    if (savedQuery) setUserCreditQuery(savedQuery);

    const savedFilters = sessionStorage.getItem('creditFilters');
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(filters => ({...filters, ...parsedFilters}));
    }

    const lastQueryType = sessionStorage.getItem('creditLastQueryType');
    if (lastQueryType === 'filter') {
      loadDataWithFilters(); // Применяем фильтры если последний тип был фильтрация
    } else if (lastQueryType === 'sql'){
      executeSqlQuery(); // Выполняем SQL запрос если последний тип был SQL
    } else {
      fetchCredits();
    }
  }, [currentPage, executeSqlQuery, fetchCredits, loadDataWithFilters]);

  // Обработчик изменений фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value || '' }));
  };
  
  // Обработка поиска с фильтрами
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    sessionStorage.setItem('creditFilters', JSON.stringify(filters));
    loadDataWithFilters();
  };
  
  // Обработка исполнения запроса
  const handleSubmitQuery = (e) => {
    e.preventDefault();
    sessionStorage.setItem('creditQuery', userCreditQuery);
    executeSqlQuery();
  };  

  // Обработка смены страниц
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className="container">
      <h2>Credits</h2>
      {role === "ROLE_ADMIN" && (
        <form onSubmit={handleSubmitQuery} className="form-standard">
          <div className="form-query-group">
            <input type="text" value={baseQuery} disabled className="base-query-input" />
            <input type="text" value={userCreditQuery} onChange={(e) => setUserCreditQuery(e.target.value)}
              placeholder="e.g., WHERE 1 = 1" className="user-query-input" />
          </div>
          <small>You can use attributes like id, client, tariff, amount, status, startDate, endDate in your WHERE clause.</small>
          <button type="submit" className="execute-query-button">Execute Query</button>
        </form>
      )}
      <form onSubmit={handleApplyFilters} className="filter-form">
        <div className="form-container">
          <div className="form-input-group">
            <label htmlFor="clientName">Client Name</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={filters.clientName}
              onChange={handleFilterChange}
              placeholder="Client Name"
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="tariffName">Tariff Name</label>
            <input
              type="text"
              id="tariffName"
              name="tariffName"
              value={filters.tariffName}
              onChange={handleFilterChange}
              placeholder="Tariff Name"
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={filters.amount}
              onChange={handleFilterChange}
              placeholder="Amount"
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="status">Credit Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">Select Credit Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="form-input-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
        </div>
        <button type="submit" className="form-button">Search</button>
      </form>
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && (
        <button onClick={() => setModalOpen(true)} className="add-button">Add Credit</button>
      )}
      {modalOpen && <AddCreditModal onClose={() => setModalOpen(false)} onCreditAdded={() => setPageCount(0)} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {Array.isArray(credits) && credits.map(credit => (
          <div key={credit.id} className="item-card" onClick={() => navigate(`/credits/${credit.id}`)}>
            <p>Client: {credit.clientName}</p>
            <p>Tariff: {credit.tariffName}</p>
            <p>Amount: {credit.amount}</p>
            <p>Status: {credit.status}</p>
            <p>Start Date: {credit.startDate.slice(0,16)}</p>
            <p>End Date: {credit.endDate.slice(0,16)}</p>
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

export default Credits;
