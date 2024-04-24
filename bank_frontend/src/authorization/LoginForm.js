import React, { useState } from 'react';
import api from './AxiosApi';
import './Authorization.css'

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/signin', { email, password });
      onLogin(response.data.token, response.data.role);
    } catch (error) {
      console.error('Ошибка аутентификации', error);
      setError('Authentication failed. Please check your username and password.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>} 
      <div>
        <label>Email:</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;
