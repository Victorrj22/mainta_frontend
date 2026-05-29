"use client";

import { useState } from "react";
import "./credits.css";

const packages = [
  { id: 1, name: "Starter Pack", price: 200, credits: 1, icon: "🥉", popular: false, features: ["Valid for 1 Basic Service", "No expiration date", "Priority Support"] },
  { id: 2, name: "Standard Pack", price: 900, credits: 5, icon: "🥈", popular: true, features: ["Valid for 5 Services", "Save $100 compared to Starter", "No expiration date", "Premium Support"] },
  { id: 3, name: "Pro Pack", price: 1700, credits: 10, icon: "🥇", popular: false, features: ["Valid for 10 Services", "Save $300 compared to Starter", "No expiration date", "Dedicated Account Manager"] }
];

export default function CreditsPage() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePurchase = (id: number) => {
    setLoadingId(id);
    // Mock Stripe Checkout flow
    setTimeout(() => {
      setLoadingId(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="credits-container">
      <div className="container">
        <div className="credits-header">
          <h1>Purchase Service Credits</h1>
          <p>Top up your account with credits to seamlessly book any cleaning or maintenance service. 1 Credit = 1 Service.</p>
        </div>

        {success && (
          <div style={{ background: '#10b981', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '40px', fontWeight: '600' }}>
            🎉 Purchase successful! Your credits have been added to your balance.
          </div>
        )}

        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`package-card ${pkg.popular ? 'popular' : ''}`}>
              {pkg.popular && <div className="popular-badge">Most Popular</div>}
              
              <div className="package-icon">{pkg.icon}</div>
              <h2 className="package-name">{pkg.name}</h2>
              <div className="package-price">${pkg.price}</div>
              <div className="package-credits">{pkg.credits} {pkg.credits === 1 ? 'Credit' : 'Credits'}</div>
              
              <ul className="package-features">
                {pkg.features.map((feature, idx) => (
                  <li key={idx}><span className="feature-check">✓</span> {feature}</li>
                ))}
              </ul>
              
              <button 
                className={pkg.popular ? "btn-primary buy-btn" : "btn-secondary buy-btn"}
                onClick={() => handlePurchase(pkg.id)}
                disabled={loadingId !== null}
              >
                {loadingId === pkg.id ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
