import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { createPayment } from '../../services/PaymentService';
import { getAllCredits } from '../../services/CreditService';
import '../AddForm.css';

export function AddPaymentModal({ onClose, onPaymentAdded }) {
  const [creditsOptions, setCreditsOptions] = useState([]);
  const [selectedCredit, setSelectedCredit] = useState(null);

  useEffect(() => {
    async function loadCredits() {
      const credits = await getAllCredits();
      setCreditsOptions(credits.map(credit => ({ value: credit.id, label: `Credit ID: ${credit.id}, Amount: ${credit.amount}` })));
    }
    loadCredits();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const paymentData = {
      credit: { id: selectedCredit.value },
      amount: event.target.amount.value,
      paymentDate: event.target.paymentDate.value,
      paymentType: event.target.paymentType.value,
      commission: event.target.commission.value,
    };
  
    try {
      await createPayment(paymentData);
      onPaymentAdded();
      onClose();
    } catch (error) {
      console.error('Failed to save payment:', error);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Payment</h2>
        <form onSubmit={handleSubmit}>
          <div className="element-form">
            <Select
              classNamePrefix="react-select"
              value={selectedCredit}
              onChange={setSelectedCredit}
              options={creditsOptions}
              placeholder="Select Credit"
            />
            <input type="number" name="amount" placeholder="Amount" required />
            <input type="datetime-local" name="paymentDate" placeholder="Payment Date" required />
            <input type="text" name="paymentType" placeholder="Payment Type" required />
            <input type="number" name="commission" placeholder="Commission" />
            <button type="submit">Add Payment</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPaymentModal;
