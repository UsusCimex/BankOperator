import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Select from 'react-select'
import { AsyncPaginate } from 'react-select-async-paginate';
import { getCreditById, updateCredit, deleteCredit } from '../../services/CreditService';
import { getClientsWithFilters } from '../../services/ClientService';
import { getTariffsWithFilters } from '../../services/TariffService';
import { getCreditPayments } from '../../services/PaymentService';
import { AddPaymentModal } from '../Payment/AddPaymentModal';
import '../History.css';
import '../DetailEdit.css';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'EXPIRED', label: 'Expired' }
];

function CreditPage() {
  const { creditId } = useParams();
  const navigate = useNavigate();
  const [credit, setCredit] = useState({
    client: null,
    tariff: null,
    amount: '',
    status: '',
    startDate: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [payments, setPayments] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCredit() {
      try {
          const data = await getCreditById(creditId);
          setCredit({
            ...data,
            client: { label: `${data.clientName}`, value: data.clientId },
            tariff: { label: `${data.tariffName}`, value: data.tariffId },
            status: data.status,
            startDate: data.startDate.slice(0, 16)
          });        

          const paymentsData = await getCreditPayments(creditId);
          setPayments(paymentsData);
      } catch (error) {
          setError("Failed to fetch credit details: " + error.message);
      } finally {
          setLoading(false);
      }
    }

    fetchCredit();
  }, [creditId]);

  const handleUpdate = async () => {
    const updatedCredit = {
      id: creditId,
      clientId: credit.client.value,
      tariffId: credit.tariff.value,
      amount: credit.amount,
      status: credit.status.value,
      startDate: credit.startDate
    };
  
    try {
      await updateCredit(creditId, updatedCredit);
      alert('Credit updated successfully');
      navigate('/credits');
    } catch (error) {
      setError("Failed to update credit: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCredit(creditId);
      navigate('/credits');
    } catch (error) {
      setError("Failed to delete credit: " + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredit({ ...credit, [name]: value });
  };

  const handleSelectChange = (name, selectedOption) => {
    setCredit({ ...credit, [name]: selectedOption ? { label: selectedOption.label, value: selectedOption.value } : '' });
  };

  const dismissError = () => {
    setError(null);
  };

  const handleAddPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
  };

  const refreshPayments = async () => {
    const paymentsData = await getCreditPayments(creditId);
    setPayments(paymentsData);
  };

  // Функция для загрузки данных клиентов с фильтрацией
  const loadClientOptions = async (searchQuery, loadedOptions, { page }) => {
    const filters = { name: searchQuery }; // добавляем фильтрацию по имени
    const response = await getClientsWithFilters(page, filters);
    return {
      options: response.content.map(client => ({
        label: `${client.name} (${client.phone})`,
        value: client.id
      })),
      hasMore: !response.last,
      additional: {
        page: page + 1
      }
    };
  };

  // Функция для загрузки данных тарифов с фильтрацией
  const loadTariffOptions = async (searchQuery, loadedOptions, { page }) => {
    const filters = { name: searchQuery }; // добавляем фильтрацию по имени
    const response = await getTariffsWithFilters(page, filters);
    return {
      options: response.content.map(tariff => ({
        label: `${tariff.name} (maxAmount = ${tariff.maxAmount})`,
        value: tariff.id
      })),
      hasMore: !response.last,
      additional: {
        page: page + 1
      }
    };
  };

  if (loading) return <div>Loading...</div>;
  if (!credit) return <div>No credit data found.</div>;

  return (
    <div className="detail-page credit-page">
      {error && (
        <div className="alert alert-danger">
          <button onClick={dismissError} className="close" title="Close">
            &times;
          </button>
          {error}
        </div>
      )}

      <h2 className="detail-header">Credit Details</h2>
      <div className="detail-details">
        <label htmlFor="client">Client:</label>
        <AsyncPaginate
          id="client"
          name="client"
          value={credit.client}
          onChange={(option) => handleSelectChange('client', option)}
          loadOptions={loadClientOptions}
          additional={{ page: 0 }}
          isClearable
          debounceTimeout={300}
          placeholder="Select Client"
        />

        <label htmlFor="tariff">Tariff:</label>
        <AsyncPaginate
          id="tariff"
          name="tariff"
          value={credit.tariff}
          onChange={(option) => handleSelectChange('tariff', option)}
          loadOptions={loadTariffOptions}
          additional={{ page: 0 }}
          isClearable
          debounceTimeout={300}
          placeholder="Select Tariff"
        />

        <label htmlFor="amount">Amount:</label>
        <input
          className="input"
          id="amount"
          name="amount"
          type="number"
          value={credit.amount}
          onChange={handleChange}
          placeholder="Amount"
        />

        <label htmlFor="status">Status:</label>
        <Select
          id="status"
          name="status"
          value={statusOptions.find(option => option.value === credit.status)}
          onChange={(option) => handleSelectChange('status', option)}
          options={statusOptions}
          placeholder="Select Status"
        />

        <label htmlFor="startDate">Start Date:</label>
        <input
          className="input"
          id="startDate"
          type="datetime-local"
          name="startDate"
          value={credit.startDate}
          onChange={handleChange}
        />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete Credit</button>
        <button className="button" onClick={handleAddPayment}>Add Payment</button>
      </div>
      <h3>Payment History</h3>
      <div className='history'>
        {payments.map(payment => (
          <Link to={`/payments/${payment.id}`} key={`payment${payment.id}`} className="history-button">
            <div className="history-content">
              <div>Amount: {payment.amount}</div>
              <div>Date: {new Date(payment.date).toLocaleDateString()}</div>
              <div>Type: {payment.paymentType}</div>
              <div>Commission: {payment.commission}</div>
            </div>
          </Link>
        ))}
      </div>
      {isPaymentModalOpen && <AddPaymentModal 
                                onClose={handlePaymentModalClose} 
                                onPaymentAdded={refreshPayments} 
                                currentCreditId={ credit.id }/>}
    </div>
  );
}

export default CreditPage;