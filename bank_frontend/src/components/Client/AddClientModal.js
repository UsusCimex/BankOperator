import React, { useState } from 'react';
import { createClient } from '../../services/ClientService';
import '../AddForm.css';

export function AddClientModal({ onClose, onClientAdded }) {
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const clientData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            passportData: formData.get('passportData'),
            birthDate: formData.get('birthDate'),
        };

        try {
            await createClient(clientData);
            onClientAdded();
            onClose();
        } catch (error) {
            console.error('Failed to save client:', error);
            setError('Failed to save client. Please try again.'); // Set error message to display in the modal
        }
    };

    return (
      <div className="modal-backdrop" onClick={(e) => e.target.className.includes('modal-backdrop') && onClose()}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>Add New Client</h2>
          {error && (
              <div className="alert alert-danger">
                  {error}
                  <button onClick={() => setError(null)} className="close">&times;</button>
              </div>
          )}
          <form onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Name" required />
              <input type="text" name="email" placeholder="Email" required />
              <input type="text" name="phone" placeholder="Phone" required />
              <input type="text" name="passportData" placeholder="Passport Data" required />
              <input type="date" name="birthDate" placeholder="Birth Date" required />
              <div className="form-buttons">
                  <button type="submit" className="button">Add Client</button>
                  <button type="button" className="button" onClick={onClose}>Cancel</button>
              </div>
          </form>
        </div>
      </div>
  );
}

export default AddClientModal;