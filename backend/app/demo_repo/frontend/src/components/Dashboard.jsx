import React, { useEffect, useState } from 'react';
import { fetchUserProfile } from '../api/apiClient';

export default function Dashboard({ token, onOpenCheckout }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUserProfile(token).then(setProfile).catch(console.error);
    }
  }, [token]);

  return (
    <div className="dashboard-view">
      <h1>Account Dashboard</h1>
      {profile ? (
        <div className="profile-card">
          <p><strong>Name:</strong> {profile.fullName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {profile.role}</p>
          <button onClick={onOpenCheckout}>Upgrade Subscription</button>
        </div>
      ) : (
        <p>Loading user profile...</p>
      )}
    </div>
  );
}
