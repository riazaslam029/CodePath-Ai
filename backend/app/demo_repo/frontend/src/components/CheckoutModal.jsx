import React, { useState } from 'react';
import { processPayment } from '../api/apiClient';

export default function CheckoutModal({ token, onClose }) {
  const [amount, setAmount] = useState(49.00);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    try {
      await processPayment(token, amount);
      setSuccess(true);
    } catch (err) {
      alert("Payment failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Secure Checkout</h3>
        {success ? (
          <div>
            <p>Payment successful!</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <div>
            <p>Total due: ${amount}</p>
            <button onClick={handlePay} disabled={processing}>
              {processing ? 'Processing...' : 'Confirm Payment'}
            </button>
            <button onClick={onClose} disabled={processing}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}
