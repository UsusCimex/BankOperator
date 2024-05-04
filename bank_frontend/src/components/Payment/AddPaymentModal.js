import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { createPayment } from '../../services/PaymentService';
import { getAllCredits } from '../../services/CreditService';
import '../AddForm.css';

export function AddPaymentModal({ onClose, onPaymentAdded, currentCreditId }) {
  const [creditsOptions, setCreditsOptions] = useState([]);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const credits = await getAllCredits();
        const options = credits.map(credit => ({
          value: credit.id,
          label: `Client: ${credit.client.name}, phone: ${credit.client.phone}, Amount: ${credit.amount}`
        }));
        setCreditsOptions(options);

        if (currentCreditId) {
          const currentCreditOption = options.find(option => option.value === currentCreditId);
          setSelectedCredit(currentCreditOption);
        }
      } catch (err) {
        console.error('Failed to fetch credits:', err);
        setError('Failed to load credits');
      }
    };
    loadCredits();
  }, [currentCreditId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const paymentData = {
      creditId: selectedCredit ? selectedCredit.value : null,
      amount: event.target.amount.value,
      paymentDate: event.target.paymentDate.value,
      paymentType: event.target.paymentType.value,
      commission: event.target.commission.value || 0,
    };

    try {
      await createPayment(paymentData);
      onPaymentAdded();
      onClose();
    } catch (error) {
      console.error('Failed to save payment:', error);
      setError('Failed to save payment. Please try again.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className.includes('modal-backdrop') && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Payment</h2>
        {error && (
          <div className="alert alert-danger">
            {error}
            <button onClick={() => setError('')} className="close">&times;</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="element-form">
          <Select
            classNamePrefix="react-select"
            value={selectedCredit}
            onChange={setSelectedCredit}
            options={creditsOptions}
            placeholder="Select Credit"
            isDisabled={!!currentCreditId}
          />
          <input type="number" name="amount" placeholder="Amount" required />
          <input type="datetime-local" name="paymentDate" placeholder="Payment Date" required />
          <input type="text" name="paymentType" placeholder="Payment Type" required />
          <input type="number" name="commission" placeholder="Commission" />
          <div className="form-buttons">
            <button type="submit" className="button">Add Payment</button>
            <button type="button" className="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPaymentModal;
