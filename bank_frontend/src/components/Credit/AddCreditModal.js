import React, { useState } from 'react';
import Select from 'react-select';
import { createCredit } from '../../services/CreditService';
import { getClientsWithFilters } from '../../services/ClientService';
import { getTariffsWithFilters } from '../../services/TariffService';
import { AsyncPaginate } from 'react-select-async-paginate';
import '../AddForm.css';

export function AddCreditModal({ onClose, onCreditAdded, currentClient }) {
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


  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className.includes('modal-backdrop') && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Credit</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit} className="element-form">
          <AsyncPaginate
            classNamePrefix="react-select"
            value={selectedClient}
            onChange={setSelectedClient}
            loadOptions={loadClientOptions}
            additional={{ page: 0 }}
            isClearable
            debounceTimeout={300}
            placeholder="Select Client"
            isDisabled={!!currentClient}
          />
          <AsyncPaginate
            classNamePrefix="react-select"
            value={selectedTariff}
            onChange={setSelectedTariff}
            loadOptions={loadTariffOptions}
            additional={{ page: 0 }}
            isClearable
            debounceTimeout={300}
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