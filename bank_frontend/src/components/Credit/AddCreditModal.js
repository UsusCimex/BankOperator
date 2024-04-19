import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { createCredit } from '../../services/CreditService';
import { getAllClients } from '../../services/ClientService';
import { getAllTariffs } from '../../services/TariffService';
import '../AddForm.css';

export function AddCreditModal({ onClose, onCreditAdded }) {
  const [clientsOptions, setClientsOptions] = useState([]);
  const [tariffsOptions, setTariffsOptions] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [startDate, setStartDate] = useState('');

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'EXPIRED', label: 'Expired' }
  ];

  useEffect(() => {
    async function loadOptions() {
      const clients = await getAllClients();
      const tariffs = await getAllTariffs();
      setClientsOptions(clients.map(client => ({ value: client.id, label: client.name })));
      setTariffsOptions(tariffs.map(tariff => ({ value: tariff.id, label: tariff.name })));
    }
    loadOptions();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const creditData = {
      client: { id: selectedClient.value },
      tariff: { id: selectedTariff.value },
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
    }
  };
   

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Credit</h2>
        <form onSubmit={handleSubmit}>
          <Select
            classNamePrefix="react-select"
            value={selectedClient}
            onChange={setSelectedClient}
            options={clientsOptions}
            placeholder="Select Client"
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
          <input type="text" name="status" placeholder="Status" required />
          <input type="datetime-local" name="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <button type="submit">Add Credit</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default AddCreditModal;
