"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("mainta_token");
    const userStr = localStorage.getItem("mainta_user");
    
    if (!token) {
      router.push("/auth/login");
    } else {
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserName(user.firstName);
          setCreditBalance(user.creditBalance || 0);
        } catch(e) {}
      }
      setLoading(false);
    }
  }, [router]);

  if (loading) return (
    <div className="loader-container">
      <div className="loader"></div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {userName}!</h1>
            <p>Manage your home services and credit balance.</p>
          </div>
          <Link href="/book/cleaning" className="btn-primary">
            + New Booking
          </Link>
        </div>

        <div className="balance-card">
          <div className="balance-info">
            <h2>Available Credits</h2>
            <div className="balance-amount">💎 {creditBalance}</div>
          </div>
          <Link href="/credits" className="btn-secondary" style={{ background: 'white', color: 'var(--primary-color)' }}>
            Get More Credits
          </Link>
        </div>

        <div className="dashboard-grid">
          <div className="dash-card">
            <h3>Recent Bookings</h3>
            <div className="empty-state">
              <p style={{ marginBottom: '16px' }}>You don't have any bookings yet.</p>
              <Link href="/book/cleaning" className="btn-secondary">
                Book a Cleaning
              </Link>
            </div>
            {/* 
            // Example of how a booking item would look
            <div className="booking-item">
              <div>
                <div className="booking-type">Premium Cleaning</div>
                <div className="booking-date">Tomorrow at 10:00 AM</div>
              </div>
              <span className="status-badge status-pending">Pending</span>
            </div> 
            */}
          </div>

          <div className="dash-card">
            <h3>Saved Addresses</h3>
            <div className="empty-state">
              <p>No addresses saved yet.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
