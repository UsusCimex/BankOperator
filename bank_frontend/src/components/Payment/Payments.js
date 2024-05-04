import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery, getPaymentsWithFilters } from '../../services/PaymentService';
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

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userPaymentQuery');
    const savedResults = sessionStorage.getItem('queryPaymentResults');
    const savedFilters = sessionStorage.getItem('paymentFilters');
    if (savedQuery) setUserPaymentQuery(savedQuery);
    if (savedResults) setPayments(JSON.parse(savedResults));
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(filters => ({...filters, ...parsedFilters}));
    }
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getPaymentsWithFilters(filters);
      const formattedData = data.map(item => ({
        id: item.id,
        clientName: item.credit.client.name,
        amount: item.amount,
        paymentDate: item.paymentDate,
        paymentType: item.paymentType,
        commission: item.commission
      }));
      setPayments(formattedData);
      sessionStorage.setItem('queryPaymentResults', JSON.stringify(formattedData));
      setError(null);
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullQuery = `${baseQuery} ${userPaymentQuery}`;
      const data = await executeCustomQuery(fullQuery);
      const formattedData = data.map(item => ({
        id: item.id,
        clientName: item.credit.client.name,
        amount: item.amount,
        paymentDate: item.paymentDate,
        paymentType: item.paymentType,
        commission: item.commission
      }));
      setPayments(formattedData);
      sessionStorage.setItem('queryPaymentResults', JSON.stringify(formattedData));
      sessionStorage.setItem('userPaymentQuery', userPaymentQuery);
      setError(null);
    } catch (error) {
      console.error("Failed to execute SQL query:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = (paymentId) => {
    if (role === "ROLE_OPERATOR" || role === "ROLE_ADMIN")
      navigate(`/payments/${paymentId}`);
  };

  const handlePaymentAdded = () => {
    fetchPayments();
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
        <small>You can use attributes like payment_id, credit_id, amount, payment_date, payment_type, commission in your WHERE clause.</small>
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
              type="date"
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
      {modalOpen && <AddPaymentModal onClose={() => setModalOpen(false)} onPaymentAdded={handlePaymentAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {payments.map(payment => (
          <div key={payment.id} className="item-card" onClick={() => handlePaymentClick(payment.id)}>
            <p>Client: {payment.clientName}</p>
            <p>Amount: {payment.amount}</p>
            <p>Payment Date: {payment.paymentDate}</p>
            <p>Payment Type: {payment.paymentType}</p>
            <p>Commission: {payment.commission}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Payments;
