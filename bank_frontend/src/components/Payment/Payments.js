import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/PaymentService';
import AddPaymentModal from './AddPaymentModal';
import '../ListView.css';

function Payments() {
  const [payments, setPayments] = useState([]);
  const baseQuery = "SELECT * FROM payment";
  const [userPaymentQuery, setUserPaymentQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userPaymentQuery');
    const savedResults = sessionStorage.getItem('queryPaymentResults');
    if (savedQuery) setUserPaymentQuery(savedQuery);
    if (savedResults) setPayments(JSON.parse(savedResults));
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const fullQuery = `${baseQuery} ${userPaymentQuery}`;
    try {
      const data = await executeCustomQuery(fullQuery);
      setPayments(data || []);
      sessionStorage.setItem('queryPaymentResults', JSON.stringify(data || []));
      sessionStorage.setItem('userPaymentQuery', userPaymentQuery);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const handlePaymentClick = (paymentId) => {
    navigate(`/payments/${paymentId}`);
  };

  const handlePaymentAdded = () => {
    fetchPayments();
  };

  return (
    <div>
      <h2>Payments</h2>
      <form onSubmit={handleSubmitQuery} className="form-standard">
        <div className="form-input-group">
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
        <button type="submit" className="form-button">Execute Query</button>
      </form>
      <button onClick={() => setModalOpen(true)} className="button button-primary">Add Payment</button>
      {modalOpen && <AddPaymentModal onClose={() => setModalOpen(false)} onPaymentAdded={handlePaymentAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {payments.map(payment => (
          <div key={payment.id} className="item-card" onClick={() => handlePaymentClick(payment.id)}>
            <p>Client: {payment.credit?.client?.name}</p>
            <p>Tariff: {payment.credit?.tariff?.name}</p>
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
