import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPaymentById, updatePayment, deletePayment } from '../../services/PaymentService';
import '../Page.css';

function PaymentPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState({
    credit: '',
    amount: 0,
    paymentDate: '',
    paymentType: '',
    commission: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPayment = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaymentById(paymentId);
      setPayment(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
      setError("Failed to fetch payment details");
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handleUpdate = async () => {
    try {
      await updatePayment(paymentId, payment);
      alert('Payment updated successfully');
    } catch (error) {
      alert('Failed to update payment');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePayment(paymentId);
      alert('Payment deleted successfully');
      navigate('/payments');
    } catch (error) {
      alert('Failed to delete payment');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment(prevState => ({ ...prevState, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!payment) return <div>No payment data found.</div>;

  return (
    <div className="payment-page">
      <h2 className="payment-header">Payment Details</h2>
      <div className="payment-details">
        <label htmlFor="credit">Credit ID:</label>
        <input className="input" id="credit" name="credit" value={payment.credit} onChange={handleChange} placeholder="Credit ID" />
        
        <label htmlFor="amount">Amount:</label>
        <input className="input" id="amount" name="amount" type="number" value={payment.amount} onChange={handleChange} placeholder="Amount" />

        <label htmlFor="paymentDate">Payment Date:</label>
        <input className="input" id="paymentDate" type="date" name="paymentDate" value={payment.paymentDate} onChange={handleChange} />

        <label htmlFor="paymentType">Payment Type:</label>
        <input className="input" id="paymentType" name="paymentType" value={payment.paymentType} onChange={handleChange} placeholder="Payment Type" />
        
        <label htmlFor="commission">Commission:</label>
        <input className="input" id="commission" name="commission" type="number" value={payment.commission} onChange={handleChange} placeholder="Commission" />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete Payment</button>
      </div>
    </div>
  );
}

export default PaymentPage;
