import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './errorPage.css';  // Custom styling for the error page

const ErrorPage = () => {
  return (
    <div className="error-wrapper">
      <h1 className="display-4 text-danger mb-3">404 Not Found</h1>
      <p className="lead mb-4">Oops! The page you're looking for doesn't exist.</p>
      <div className="error-message error mb-4">Sorry for the inconvenience!</div>
      <Link to="/" className="error-button">
        Go Back Home
      </Link>
    </div>
  );
};

export default ErrorPage;
