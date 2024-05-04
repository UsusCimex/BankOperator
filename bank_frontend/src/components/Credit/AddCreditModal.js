import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { createCredit } from '../../services/CreditService';
import { getAllClients } from '../../services/ClientService';
import { getAllTariffs } from '../../services/TariffService';
import '../AddForm.css';

export function AddCreditModal({ onClose, onCreditAdded, currentClient }) {
  const [clientsOptions, setClientsOptions] = useState([]);
  const [tariffsOptions, setTariffsOptions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(currentClient || null);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'EXPIRED', label: 'Expired' }
  ];

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const clients = await getAllClients();
        const tariffs = await getAllTariffs();
        setClientsOptions(clients.map(client => ({ value: client.id, label: client.name })));
        setTariffsOptions(tariffs.map(tariff => ({ value: tariff.id, label: tariff.name })));
      } catch (err) {
        console.error('Failed to fetch options:', err);
        setError('Failed to load options');
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const creditData = {
      clientId: selectedClient ? selectedClient.value : null,
      tariffId: selectedTariff ? selectedTariff.value : null,
      amount: event.target.amount.value,
      status: selectedStatus ? selectedStatus.value : '',
      startDate: startDate,
    };

    try {
      await createCredit(creditData);
      onCreditAdded();
      onClose();
    } catch (error) {
      console.error('Failed to save credit:', error);
      setError('Failed to save credit. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className.includes('modal-backdrop') && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Credit</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="element-form">
          <Select
            classNamePrefix="react-select"
            value={selectedClient}
            onChange={setSelectedClient}
            options={clientsOptions}
            placeholder="Select Client"
            isDisabled={!!currentClient}
          />
          <Select
            classNamePrefix="react-select"
            value={selectedTariff}
            onChange={setSelectedTariff}
            options={tariffsOptions}
            placeholder="Select Tariff"
          />
          <Select
            classNamePrefix="react-select"
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={statusOptions}
            placeholder="Select Status"
          />
          <input type="number" name="amount" placeholder="Amount" required />
          <input type="datetime-local" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <div className="form-buttons">
            <button type="submit" className="button">Add Credit</button>
            <button type="button" className="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCreditModal;