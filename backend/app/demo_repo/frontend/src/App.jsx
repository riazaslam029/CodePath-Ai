import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CheckoutModal from './components/CheckoutModal';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [showCheckout, setShowCheckout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h2>Enterprise Cloud App</h2>
        {token && <button onClick={handleLogout}>Log Out</button>}
      </header>
      <main>
        {!token ? (
          <Login onLoginSuccess={(user) => setToken(localStorage.getItem('auth_token'))} />
        ) : (
          <Dashboard token={token} onOpenCheckout={() => setShowCheckout(true)} />
        )}
        {showCheckout && (
          <CheckoutModal token={token} onClose={() => setShowCheckout(false)} />
        )}
      </main>
    </div>
  );
}
