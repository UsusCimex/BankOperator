import React from 'react';
import { createTariff } from '../../services/TariffService';
import '../AddForm.css';

export function AddTariffModal({ onClose, onTariffAdded }) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const tariffData = {
      name: formData.get('name'),
      loanTerm: parseInt(formData.get('loanTerm'), 10),
      interestRate: parseFloat(formData.get('interestRate')),
      maxAmount: parseInt(formData.get('maxAmount'), 10),
    };

    try {
      await createTariff(tariffData);
      onTariffAdded();
      onClose();
    } catch (error) {
      console.error('Failed to save tariff:', error);
      alert('Failed to save tariff: ' + error.message); // Show user-friendly error message
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Tariff</h2>
        <form onSubmit={handleSubmit}>
          <div className="element-form">
            <input type="text" name="name" placeholder="Name" required />
            <input type="number" name="loanTerm" placeholder="Loan Term" required />
            <input type="number" name="interestRate" placeholder="Interest Rate" step="0.01" required />
            <input type="number" name="maxAmount" placeholder="Maximum Amount" required />
            <button type="submit">Add Tariff</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTariffModal;
