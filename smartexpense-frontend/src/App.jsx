import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  // Checking if a token exists in localStorage to manage authentication state
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <div className="App">
      {/* Main Routing Logic: 
          If token exists, show the Dashboard.
          Otherwise, show the Login page and pass setToken as a prop 
          to update the state after a successful login.
      */}
      {token ? (
        <Dashboard />
      ) : (
        <Login setToken={setToken} />
      )}
    </div>
  );
}

export default App;