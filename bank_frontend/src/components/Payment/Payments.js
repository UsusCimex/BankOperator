import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/PaymentService';
import { AddPaymentModal } from './AddPaymentModal'
import '../SharedStyle.css';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [baseQuery] = useState("SELECT * FROM payment");
  const [userPaymentQuery, setuserPaymentQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userPaymentQuery');
    const savedResults = sessionStorage.getItem('queryPaymentResults');
    if (savedQuery) setuserPaymentQuery(savedQuery);
    if (savedResults) setPayments(JSON.parse(savedResults));
  }, []);

  const fetchPayments = async (customQuery) => {
    setLoading(true);
    try {
      const data = await executeCustomQuery(customQuery);
      console.log("Received data:", data);
      setPayments(data || []);
      sessionStorage.setItem('queryPaymentResults', JSON.stringify(data || []));
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
    const fullQuery = `${baseQuery} ${userPaymentQuery}`;
    fetchPayments(fullQuery);
    sessionStorage.setItem('userPaymentQuery', userPaymentQuery);
  };

  const handlePaymentClick = (paymentId) => {
    navigate(`/payments/${paymentId}`);
  };

  const handlePaymentAdded = () => {
    fetchPayments(`${baseQuery} ${userPaymentQuery}`);
  };

  return (
    <div>
      <h2>Payments</h2>
      <form onSubmit={handleSubmitQuery} className="query-form">
        <div className="query-inputs">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input"
          />
          <input 
            type="text" 
            value={userPaymentQuery} 
            onChange={(e) => setuserPaymentQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input"
          />
        </div>
        <small>You can use attributes like payment_id, credit_id, amount, payment_date, payment_type, commission in your WHERE clause.</small>
        <button type="submit">Execute Query</button>
      </form>
      <button onClick={() => setModalOpen(true)} className="add-element-btn">Add Payment</button>
      {modalOpen && <AddPaymentModal onClose={() => setModalOpen(false)} onPaymentAdded={handlePaymentAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      <div className="element-list">
        {payments && payments.map(payment => (
          <div key={payment.id} className="element-card" onClick={() => handlePaymentClick(payment.id)}>
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
