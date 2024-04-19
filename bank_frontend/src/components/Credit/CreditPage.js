import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { getCreditById, updateCredit, deleteCredit } from '../../services/CreditService';
import { getAllClients } from '../../services/ClientService';
import { getAllTariffs } from '../../services/TariffService';
import '../Page.css';

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
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClientsAndTariffs() {
      setLoading(true);
      try {
        const clients = await getAllClients();
        const clientOptions = clients.map(client => ({
          value: client.id,
          label: `${client.name} (phone: ${client.phone})`,
          data: client
        }));
        const tariffs = await getAllTariffs();
        const tariffOptions = tariffs.map(tariff => ({
          value: tariff.id,
          label: `${tariff.name}`,
          data: tariff
        }));
        setStatusOptions([
          { value: 'ACTIVE', label: 'Active' },
          { value: 'CLOSED', label: 'Closed' },
          { value: 'EXPIRED', label: 'Expired' }
        ]);
        setClientsOptions(clientOptions);
        setTariffsOptions(tariffOptions);
      } catch (error) {
        console.error("Failed to fetch clients or tariffs:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClientsAndTariffs();
  }, []);

  useEffect(() => {
    async function fetchCredit() {
      if (loading || !statusOptions.length) return;
      try {
        const data = await getCreditById(creditId);
        setCredit({
          ...data,
          client: data.client ? clientsOptions.find(c => c.value === data.client.id) : null,
          tariff: data.tariff ? tariffsOptions.find(t => t.value === data.tariff.id) : null,
          status: statusOptions.find(option => option.value === data.status).value || '',
          startDate: data.startDate || ''
        });
      } catch (error) {
        console.error("Failed to fetch credit details:", error);
        setError(error.message);
      }
    }
    if (clientsOptions.length > 0 && tariffsOptions.length > 0 && statusOptions.length > 0) {
      fetchCredit();
    }
  }, [creditId, clientsOptions, tariffsOptions, statusOptions, loading]);

  const handleUpdate = async () => {
    try {
      const updatedCredit = {
        ...credit,
        client: credit.client?.data,
        tariff: credit.tariff?.data,
        status: credit.status
      };
  
      console.log("Updating credit with data:", updatedCredit);
  
      await updateCredit(creditId, updatedCredit);
      alert('Credit updated successfully');
    } catch (error) {
      alert('Failed to update credit');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCredit(creditId);
      alert('Credit deleted successfully');
      navigate('/credits');
    } catch (error) {
      alert('Failed to delete credit');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredit(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSelectChange = (field, option) => {
    setCredit(prevState => ({
      ...prevState,
      [field]: field === 'status' ? (option ? option.value : '') : (option ? option.data : null)
    }));
  };  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!credit) return <div>No credit data found.</div>;

  return (
    <div className="credit-page">
      <h2 className="credit-header">Credit Details</h2>
      <div className="credit-details">
        <label htmlFor="client">Client:</label>
        <Select
          id="client"
          name="client"
          value={credit.client}
          onChange={option => handleSelectChange('client', option)}
          options={clientsOptions}
          placeholder="Select Client"
        />

        <label htmlFor="tariff">Tariff:</label>
        <Select
          id="tariff"
          name="tariff"
          value={credit.tariff}
          onChange={option => handleSelectChange('tariff', option)}
          options={tariffsOptions}
          placeholder="Select Tariff"
        />

        <label htmlFor="amount">Amount:</label>
        <input className="input" id="amount" name="amount" type="number" value={credit.amount} onChange={handleChange} placeholder="Amount" />

        <label htmlFor="status">Status:</label>
        <Select
          id="status"
          name="status"
          value={statusOptions.find(option => option.value === credit.status)}
          onChange={option => handleSelectChange('status', option)}
          options={statusOptions}
          placeholder="Select Status"
        />

        <label htmlFor="startDate">Start Date:</label>
        <input className="input" id="startDate" type="datetime-local" name="startDate" value={credit.startDate} onChange={handleChange} />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete Credit</button>
      </div>
    </div>
  );
}

export default CreditPage;
