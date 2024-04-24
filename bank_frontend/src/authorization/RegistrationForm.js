import React, { useState } from 'react';
import api from './AxiosApi';
import './Authorization.css'

const RegistrationForm = ({ onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('OPERATOR');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/signup', { email, password, role });
      onSignUp(response.data.token);
      console.log('Registration successful');
    } catch (error) {
      console.error('Ошибка регистрации', error);
      setError('Registration failed. Please check the details and try again.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div>
        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ROLE_OPERATOR">Operator</option>
          <option value="ROLE_TARIFF_MANAGER">Tariff Manager</option>
          <option value="ROLE_ACCOUNTANT">Accountant</option>
        </select>
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default RegistrationForm;
