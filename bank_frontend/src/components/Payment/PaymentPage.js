import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AsyncPaginate } from 'react-select-async-paginate';
import { getPaymentById, updatePayment, deletePayment } from '../../services/PaymentService';
import { getCreditsWithFilters } from '../../services/CreditService';
import '../DetailEdit.css';

function PaymentPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState({
    credit: null,
    amount: 0,
    paymentDate: '',
    paymentType: '',
    commission: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для загрузки данных клиентов с фильтрацией
  const loadCreditOptions = async (searchQuery, loadedOptions, { page }) => {
    const filters = { clientName: searchQuery }; // добавляем фильтрацию по имени
    const response = await getCreditsWithFilters(page, filters);
    return {
      options: response.content.map(credit => ({
        label: `${credit.clientName} (${credit.status})`,
        value: credit.id
      })),
      hasMore: !response.last,
      additional: {
        page: page + 1
      }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const paymentDetails = await getPaymentById(paymentId);
        setPayment({
          ...paymentDetails,
          credit: { label: `Client: ${paymentDetails.clientName}, Tariff: ${paymentDetails.tariffName}, Amount: ${paymentDetails.amount}`, value: paymentDetails.creditId },
          paymentDate: paymentDetails.paymentDate.slice(0, 16)
        });
        setError(null);
      } catch (error) {
        setError("Failed to load data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paymentId]);

  const handleUpdate = async () => {
    try {
      const updatedPayment = {
          ...payment,
          credit: payment.credit,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentType: payment.paymentType,
          commission: payment.commission
      };

      await updatePayment(paymentId, updatedPayment);
      alert('Payment updated successfully');
      navigate('/payments');
  } catch (error) {
      setError("Failed to update payment: " + error.message);
  }
  };

  const handleDelete = async () => {
    try {
      await deletePayment(paymentId);
      navigate('/payments');
    } catch (error) {
      setError("Failed to delete payment: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (option) => {
    setPayment(prev => ({ ...prev, credit: option ? option.data : null }));
  };  

  if (loading) return <div>Loading...</div>;
  if (!payment) return <div>No payment data found.</div>;

  return (
    <div className="detail-page payment-page">
      {error && (
        <div className="alert alert-danger">
          <button onClick={() => setError(null)} className="close" title="Close">
            &times;
          </button>
          {error}
        </div>
      )}

      <h2 className="detail-header">Payment Details</h2>
      <div className="detail-details">
        <label htmlFor="credit">Credit:</label>
        <AsyncPaginate
          name="credit"
          value={payment.credit}
          onChange={handleSelectChange}
          loadOptions={loadCreditOptions}
          additional={{ page: 0 }}
          isClearable
          debounceTimeout={300}
          placeholder="Select Credit"
          className="input"
        />

        <label htmlFor="amount">Amount:</label>
        <input
          className="input"
          id="amount"
          name="amount"
          type="number"
          value={payment.amount}
          onChange={handleChange}
          placeholder="Amount"
        />

        <label htmlFor="paymentDate">Payment Date:</label>
        <input
          className="input"
          id="paymentDate"
          type="datetime-local"
          name="paymentDate"
          value={payment.paymentDate}
          onChange={handleChange}
        />

        <label htmlFor="paymentType">Payment Type:</label>
        <input
          className="input"
          id="paymentType"
          name="paymentType"
          value={payment.paymentType}
          onChange={handleChange}
          placeholder="Payment Type"
        />

        <label htmlFor="commission">Commission:</label>
        <input
          className="input"
          id="commission"
          name="commission"
          type="number"
          value={payment.commission}
          onChange={handleChange}
          placeholder="Commission"
        />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete Payment</button>
      </div>
    </div>
  );
}

export default PaymentPage;
