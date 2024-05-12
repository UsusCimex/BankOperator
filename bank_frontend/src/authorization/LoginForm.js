import React, { useState } from 'react';
import api from './AxiosApi';
import './Authorization.css';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const response = await api.post('/signin', { email, password });
      onLogin(response.data.token, response.data.role);
    } catch (error) {
      setError('Authentication failed. Please check your email and password.');
    }
  };

  // Функция запроса на сброс пароля
  const handlePasswordResetRequest = async () => {
    if (!email) {
      setError("Please enter your email to reset your password.");
      return;
    }
    try {
      setError(null);
      setResetMessage("Try to send email...");
      await api.post('/request-reset-password', { email });  // Проверьте правильный ли endpoint
      setResetMessage("If the email is associated with an account, a reset link has been sent.");
    } catch (error) {
      setError("Failed to send reset link.");
      setResetMessage(null);
      console.error("Error sending password reset email", error);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resetMessage && <p style={{ color: 'green' }}>{resetMessage}</p>}
      <div>
        <label>Email:</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Login</button>
      <button type="button" onClick={handlePasswordResetRequest}>Reset Password</button>
    </form>
  );
};

export default LoginForm;
