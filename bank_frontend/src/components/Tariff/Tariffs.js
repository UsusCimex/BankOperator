import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { getAllTariffs, executeCustomQuery, getTariffsWithFilters } from '../../services/TariffService';
import AddTariffModal from './AddTariffModal';
import '../ListView.css';

function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '', loanTerm: '', interestRate: '', maxAmount: ''
  });
  const baseQuery = "SELECT * FROM tariff";
  const [userTariffQuery, setUserTariffQuery] = useState("");
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');
  const [currentPage, setCurrentPage] = useState(parseInt(sessionStorage.getItem('tariffCurrentPage')) || 0);
  const [pageCount, setPageCount] = useState(parseInt(sessionStorage.getItem('tariffPageCount')) || 0);

  const fetchTariffs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllTariffs(currentPage);
      setTariffs(data.content);
      setPageCount(data.totalPages);
      sessionStorage.setItem('tariffCurrentPage', data.currentPage);
      sessionStorage.setItem('tariffPageCount', data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Не удалось получить тарифы:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadDataWithFilters = useCallback(async () => {
    setLoading(true);
    try {
      const savedFilters = sessionStorage.getItem('tariffFilters');
      if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          const filteredData = await getTariffsWithFilters(currentPage, parsedFilters);
          setTariffs(filteredData.content);
          setPageCount(filteredData.totalPages);
          sessionStorage.setItem('tariffCurrentPage', currentPage.toString());
          sessionStorage.setItem('tariffPageCount', pageCount.toString());
          sessionStorage.setItem('tariffLastQueryType', 'filter');
      }
      setError(null);
    } catch (error) {
      console.error("Не удалось отфильтровать тарифы:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageCount]);

  const executeSqlQuery = useCallback(async () => {
    setLoading(true);
    try {
      const query = sessionStorage.getItem('tariffsQuery');
      const fullQuery = `${baseQuery} ${query}`;
      const data = await executeCustomQuery(fullQuery);
      setTariffs(data);
      setPageCount(0);
      setCurrentPage(0);
      sessionStorage.setItem('tariffCurrentPage', '0');
      sessionStorage.setItem('tariffPageCount', '0');
      sessionStorage.setItem('tariffLastQueryType', 'sql');

      setError(null);
    } catch (error) {
      console.error("Не удалось выполнить SQL запрос:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [baseQuery]);

  // Загрузка сохраненных данных из sessionStorage при монтировании
  const fetchData = useCallback(() => {
    const savedQuery = sessionStorage.getItem('tariffsQuery');
    if (savedQuery) setUserTariffQuery(savedQuery);

    const savedFilters = sessionStorage.getItem('tariffFilters');
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(filters => ({...filters, ...parsedFilters}));
    }

    const lastQueryType = sessionStorage.getItem('tariffLastQueryType');
    if (lastQueryType === 'filter') {
      loadDataWithFilters(); // Применяем фильтры если последний тип был фильтрация
    } else if (lastQueryType === 'sql'){
      executeSqlQuery(); // Выполняем SQL запрос если последний тип был SQL
    } else {
      fetchTariffs();
    }
  }, [executeSqlQuery, fetchTariffs, loadDataWithFilters]);

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
    sessionStorage.setItem('tariffFilters', JSON.stringify(filters));
    loadDataWithFilters();
  };
  
  // Обработка исполнения запроса
  const handleSubmitQuery = (e) => {
    e.preventDefault();
    sessionStorage.setItem('tariffsQuery', userTariffQuery);
    executeSqlQuery();
  };  

  // Обработка смены страниц
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className="container">
      <h2>Tariffs</h2>
      {role === "ROLE_ADMIN" && (
      <form onSubmit={handleSubmitQuery} className="form-standard">
        <div className="form-query-group">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input"
          />
          <input 
            type="text" 
            value={userTariffQuery} 
            onChange={(e) => setUserTariffQuery(e.target.value)} 
            placeholder="e.g., WHERE name = 'Standard'"
            className="user-query-input"
          />
        </div>
        <small>You can use attributes like id, name, loanTerm, interestRate, maxAmount in your WHERE clause.</small>
        <button type="submit" className="execute-query-button">Execute Query</button>
      </form>
      )}
      <form onSubmit={handleApplyFilters} className="filter-form">
        <div className="form-container">
          {Object.keys(filters).map((key) => (
            <div key={key} className="form-input-group">
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input
                type="text"
                id={key}
                name={key}
                value={filters[key]}
                onChange={handleFilterChange}
                placeholder={`Enter ${key}`}
                className="form-input"
              />
            </div>
          ))}
        </div>
        <button type="submit" className="form-button">Search</button>
      </form>
      {(role === "ROLE_TARIFF_MANAGER" || role === "ROLE_ADMIN") && <button onClick={() => setModalOpen(true)} className="add-button">Add Tariff</button>}
      {modalOpen && 
        <AddTariffModal 
          onClose={() => {
            setModalOpen(false);
            setCurrentPage(0);
          }} 
          onTariffAdded={() => setPageCount(0)} />
      }
      {loading && 
        <div>Loading...</div>
      }
      {error && 
        <div className="alert-danger">Error: {error}</div>
      }
      <div className="list-container">
        {Array.isArray(tariffs) && tariffs.map(tariff => (
          <div 
            key={tariff.id} 
            className="item-card" 
            onClick={() => navigate(`/tariffs/${tariff.id}`)}
          >
            <p>Name: {tariff.name}</p>
            <p>Loan Term: {tariff.loanTerm} months</p>
            <p>Interest Rate: {tariff.interestRate}%</p>
            <p>Maximum Amount: {tariff.maxAmount}</p>
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

export default Tariffs;
