import React, { useState } from 'react';
import { createTariff } from '../../services/TariffService';
import '../AddForm.css';

export function AddTariffModal({ onClose, onTariffAdded }) {
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const tariffData = {
      name: formData.get('name'),
      loanTerm: parseInt(formData.get('loanTerm'), 10),
      interestRate: parseInt(formData.get('interestRate'), 10),  // Changed to parseInt for integer value
      maxAmount: parseInt(formData.get('maxAmount'), 10),
    };

    try {
      await createTariff(tariffData);
      onTariffAdded();
      onClose();
    } catch (error) {
      console.error('Failed to save tariff:', error);
      setError('Failed to save tariff: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className.includes('modal-backdrop') && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Tariff</h2>
        {error && (
          <div className="alert alert-danger">
            {error}
            <button onClick={() => setError('')} className="close">&times;</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="element-form">
          <input type="text" name="name" placeholder="Name" required />
          <input type="number" name="loanTerm" placeholder="Loan Term (months)" required />
          <input type="number" name="interestRate" placeholder="Interest Rate (%)" required />
          <input type="number" name="maxAmount" placeholder="Maximum Amount" required />
          <div className="form-buttons">
            <button type="submit" className="button">Add Tariff</button>
            <button type="button" className="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTariffModal;
