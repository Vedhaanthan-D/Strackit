import React from 'react';
import '../styles/LoginSuccess.css';

const LoginSuccess = () => {
  return (
    <div className="login-success-container">
      <div className="login-success-content">
        <div className="success-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h1 className="success-title">You have been logged in successfully!</h1>
        <p className="success-message">Welcome back! You can now access your account.</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
