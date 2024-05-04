import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Select from 'react-select';
import { getCreditById, updateCredit, deleteCredit } from '../../services/CreditService';
import { getAllClients } from '../../services/ClientService';
import { getAllTariffs } from '../../services/TariffService';
import { getCreditPayments } from '../../services/PaymentService'
import { AddPaymentModal } from '../Payment/AddPaymentModal'
import '../History.css'
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
  const [clientsOptions, setClientsOptions] = useState([]);
  const [tariffsOptions, setTariffsOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [payments, setPayments] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [clients, tariffs] = await Promise.all([getAllClients(), getAllTariffs()]);
        setClientsOptions(clients.map(client => ({
          value: client.id,
          label: `${client.name} (phone: ${client.phone})`,
          data: client
        })));
        setTariffsOptions(tariffs.map(tariff => ({
          value: tariff.id,
          label: `${tariff.name}`,
          data: tariff
        })));
        setError(null);
      } catch (error) {
        setError("Failed to fetch clients or tariffs: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchCredit() {
      try {
        const data = await getCreditById(creditId);
        setCredit({
          ...data,
          client: clientsOptions.find(c => c.value === data.client.id) || null,
          tariff: tariffsOptions.find(t => t.value === data.tariff.id) || null,
          status: data.status || '',
          startDate: data.startDate || ''
        });

        const paymentsData = await getCreditPayments(creditId);
        setPayments(paymentsData);
      } catch (error) {
        setError("Failed to fetch credit details: " + error.message);
      }
    }

    if (!loading && clientsOptions.length > 0 && tariffsOptions.length > 0) {
      fetchCredit();
    }
  }, [creditId, clientsOptions, tariffsOptions, loading]);

  const handleUpdate = async () => {
    const updatedCredit = {
      ...credit,
      client: credit.client?.data,
      tariff: credit.tariff?.data,
      status: credit.status
    };

    try {
      await updateCredit(creditId, updatedCredit);
      alert('Client updated successfully');
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
    setCredit({ ...credit, [name]: selectedOption ? selectedOption.value : '' });
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
        <Select
          id="client"
          name="client"
          value={credit.client}
          onChange={(option) => handleSelectChange('client', option)}
          options={clientsOptions}
          placeholder="Select Client"
        />

        <label htmlFor="tariff">Tariff:</label>
        <Select
          id="tariff"
          name="tariff"
          value={credit.tariff}
          onChange={(option) => handleSelectChange('tariff', option)}
          options={tariffsOptions}
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
              <div>Type: {payment.type}</div>
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