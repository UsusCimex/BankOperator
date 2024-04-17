import React from 'react';
import { createClient } from '../../services/ClientService';
import '../SharedStyle.css';

export function AddClientModal({ onClose, onClientAdded }) {
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
        await saveClient(clientData);
        onClientAdded();
        onClose();
      } catch (error) {
        console.error('Failed to save client:', error);
      }
    };
  
    const saveClient = async (clientData) => {
      await createClient(clientData);
    };
  
    return (
      <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h2>Add New Client</h2>
          <form onSubmit={handleSubmit}>
            <div className="element-form">
              <input type="text" name="name" placeholder="Name" required />
              <input type="text" name="email" placeholder="Email" required />
              <input type="text" name="phone" placeholder="Phone" required />
              <input type="text" name="passportData" placeholder="Passport Data" required />
              <input type="date" name="birthDate" placeholder="Birth Date" required />
              <button type="submit">Add Client</button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  