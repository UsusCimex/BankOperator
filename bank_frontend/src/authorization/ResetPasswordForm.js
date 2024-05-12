import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from './AxiosApi';
import './Authorization.css'

const ResetPasswordForm = () => {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        try {
            const params = new URLSearchParams({ token }).toString();
            const response = await api.post(`/reset-password?${params}`, { newPassword: password });
            setMessage('Password has been reset successfully', response.data);
        } catch (error) {
            setMessage('Failed to reset password');
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            {message && <p>{message}</p>}
            
            <input type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="New Password" 
                required />

            <input type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Confirm Password" 
                required />

            <button type="submit">Reset Password</button>
        </form>
    );
};


export default ResetPasswordForm;
