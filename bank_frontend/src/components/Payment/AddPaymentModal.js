import React, { useState, useEffect } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { createPayment } from '../../services/PaymentService';
import { getCreditsWithFilters, getCreditById } from '../../services/CreditService';
import '../AddForm.css';

export function AddPaymentModal({ onClose, onPaymentAdded, currentCreditId }) {
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCredit = async () => {
      if (currentCreditId) {
        try {
          const creditDetails = await getCreditById(currentCreditId);
          setSelectedCredit({
            label: `Client: ${creditDetails.clientName}, Amount: ${creditDetails.amount}`,
            value: creditDetails.id
          });
        } catch (err) {
          console.error('Failed to fetch credit details:', err);
          setError('Failed to load the credit details');
        }
      }
    };
    fetchCredit();
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

  const loadCreditOptions = async (searchQuery, loadedOptions, { page }) => {
    const response = await getCreditsWithFilters(page, searchQuery);
    return {
      options: response.content.map(credit => ({
        label: `Client: ${credit.clientName}, Amount: ${credit.amount}`,
        value: credit.id
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
        <h2>Add New Payment</h2>
        {error && (
          <div className="alert alert-danger">
            {error}
            <button onClick={() => setError('')} className="close">&times;</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="element-form">
          <AsyncPaginate
            classNamePrefix="react-select"
            value={selectedCredit}
            onChange={setSelectedCredit}
            loadOptions={loadCreditOptions}
            additional={{ page: 0 }}
            isClearable
            debounceTimeout={300}
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
