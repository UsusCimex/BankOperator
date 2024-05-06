import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { executeCustomQuery, getAllPayments, getPaymentsWithFilters } from '../../services/PaymentService';
import AddPaymentModal from './AddPaymentModal';
import '../ListView.css';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    creditOwner: '', amount: '', paymentDate: '', commission: ''
  });
  const baseQuery = "SELECT * FROM payment";
  const [userPaymentQuery, setUserPaymentQuery] = useState("");
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');
  const [currentPage, setCurrentPage] = useState(parseInt(sessionStorage.getItem('paymentCurrentPage')) || 0);
  const [pageCount, setPageCount] = useState(parseInt(sessionStorage.getItem('paymentPageCount')) || 0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPayments(currentPage);
      setPayments(data.content);
      setPageCount(data.totalPages);
      sessionStorage.setItem('paymentCurrentPage', data.currentPage);
      sessionStorage.setItem('paymentPageCount', data.totalPages);
      setError(null);
    } catch (error) {
      console.error("Не удалось получить платежи:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const loadDataWithFilters = useCallback(async () => {
    setLoading(true);
    try {
      const savedFilters = sessionStorage.getItem('paymentFilters');
      if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          const filteredData = await getPaymentsWithFilters(currentPage, parsedFilters);
          setPayments(filteredData.content);
          setPageCount(filteredData.totalPages);
          sessionStorage.setItem('paymentCurrentPage', currentPage.toString());
          sessionStorage.setItem('paymentPageCount', pageCount.toString());
          sessionStorage.setItem('paymentLastQueryType', 'filter');
      }
      setError(null);
    } catch (error) {
      console.error("Не удалось отфильтровать платежи:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageCount]);

  const executeSqlQuery = useCallback(async () => {
    setLoading(true);
    try {
      const query = sessionStorage.getItem('paymentsQuery');
      const fullQuery = `${baseQuery} ${query}`;
      const data = await executeCustomQuery(fullQuery);
      setPayments(data);
      setPageCount(0);
      setCurrentPage(0);
      sessionStorage.setItem('paymentCurrentPage', '0');
      sessionStorage.setItem('paymentPageCount', '0');
      sessionStorage.setItem('paymentLastQueryType', 'sql');

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
    const savedQuery = sessionStorage.getItem('paymentsQuery');
    if (savedQuery) setUserPaymentQuery(savedQuery);

    const savedFilters = sessionStorage.getItem('paymentFilters');
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(filters => ({...filters, ...parsedFilters}));
    }

    const lastQueryType = sessionStorage.getItem('paymentLastQueryType');
    if (lastQueryType === 'filter') {
      loadDataWithFilters(); // Применяем фильтры если последний тип был фильтрация
    } else if (lastQueryType === 'sql'){
      executeSqlQuery(); // Выполняем SQL запрос если последний тип был SQL
    } else {
      fetchPayments();
    }
  }, [currentPage, executeSqlQuery, fetchPayments, loadDataWithFilters]);

  // Обработчик изменений фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value || '' }));
  };
  
  // Обработка поиска с фильтрами
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    sessionStorage.setItem('paymentFilters', JSON.stringify(filters));
    loadDataWithFilters();
  };
  
  // Обработка исполнения запроса
  const handleSubmitQuery = (e) => {
    e.preventDefault();
    sessionStorage.setItem('paymentsQuery', userPaymentQuery);
    executeSqlQuery();
  };  

  // Обработка смены страниц
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className="container">
      <h2>Payments</h2>
      {role === "ROLE_ADMIN" && (
      <form onSubmit={handleSubmitQuery} className="form-standard">
        <div className="form-query-group">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input form-input"
          />
          <input 
            type="text" 
            value={userPaymentQuery} 
            onChange={(e) => setUserPaymentQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input form-input"
          />
        </div>
        <small>You can use attributes like id, credit, amount, paymentDate, paymentType, commission in your WHERE clause.</small>
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
              placeholder="Enter client name"
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
              placeholder="Enter amount"
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="paymentDate">Payment Date</label>
            <input
              type="datetime-local"
              id="paymentDate"
              name="paymentDate"
              value={filters.paymentDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="commission">Commission</label>
            <input
              type="number"
              id="commission"
              name="commission"
              value={filters.commission}
              onChange={handleFilterChange}
              placeholder="Enter commission"
              className="form-input"
            />
          </div>
        </div>
        <button type="submit" className="form-button">Search</button>
      </form>
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && <button onClick={() => setModalOpen(true)} className="add-button">Add Payment</button>}
      {modalOpen && <AddPaymentModal onClose={() => setModalOpen(false)} onPaymentAdded={() => setPageCount(0)} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {Array.isArray(payments) && payments.map(payment => (
          <div 
            key={payment.id} 
            className="item-card" 
            onClick={() => navigate(`/payments/${payment.id}`)}
          >
            <p>Client: {payment.clientName}</p>
            <p>Tariff: {payment.tariffName}</p>
            <p>Amount: {payment.amount}</p>
            <p>Payment Date: {payment.paymentDate}</p>
            <p>Payment Type: {payment.paymentType}</p>
            <p>Commission: {payment.commission}</p>
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

export default Payments;
