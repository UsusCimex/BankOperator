import React, { useState } from 'react';
import LoginForm from '../authorization/LoginForm';
import RegistrationForm from '../authorization/RegistrationForm';
import '../authorization/Authorization.css'

const Home = ({ isAuthenticated, onLogin }) => {
  const [showRegistration, setShowRegistration] = useState(false);

  return (
    <div>
      {isAuthenticated ? (
        <>
          <h1>Welcome to the Credit Management System</h1>
          <p>Select a section from the navigation menu.</p>
        </>
      ) : localStorage.removeItem('token') || showRegistration ? (
        <>
          <RegistrationForm onSignUp={onLogin} />
          <button className='auth-form toggle-button' onClick={() => setShowRegistration(false)}>Have account? Login here!</button>
        </>
      ) : (
        <>
          <LoginForm onLogin={onLogin} />
          <button className='auth-form toggle-button' onClick={() => setShowRegistration(true)}>No account? Register here!</button>
        </>
      )}
    </div>
  );
};

export default Home;
