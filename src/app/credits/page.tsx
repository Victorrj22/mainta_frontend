"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import "./credits.css";

const packages = [
  { id: 1, name: "Bronze Plan", price: 200, credits: 200, icon: "🥉", popular: false, features: ["Ideal for small services", "No expiration date", "Standard Support"] },
  { id: 2, name: "Silver Plan", price: 500, credits: 500, icon: "🥈", popular: true, features: ["Ideal for regular cleaning", "No expiration date", "Premium Support"] },
  { id: 3, name: "Gold Plan", price: 1000, credits: 1000, icon: "🥇", popular: false, features: ["Great for large properties", "No expiration date", "Dedicated Manager"] },
  { id: 4, name: "Diamond Plan", price: 2000, credits: 2000, icon: "💎", popular: false, features: ["Ultimate convenience", "No expiration date", "24/7 Priority Support"] }
];

function CreditsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const missing = searchParams.get('missing');
  const successParam = searchParams.get('success');
  
  const [loadingId, setLoadingId] = useState<number | string | null>(null);
  const [success, setSuccess] = useState(successParam === 'true');
  const [customAmount, setCustomAmount] = useState<string>(missing || "");

  // Clear success param and fetch updated balance on mount
  useEffect(() => {
    const userStr = localStorage.getItem("mainta_user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    const userObj = JSON.parse(userStr);
    if (!userObj.id) {
      localStorage.removeItem("mainta_user");
      router.push("/auth/login");
      return;
    }

    if (successParam === 'true') {
      const userStr = localStorage.getItem("mainta_user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        // Sync balance from DB after Stripe success
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userObj.id}`)
          .then(res => res.json())
          .then(data => {
            userObj.creditBalance = data.creditBalance;
            localStorage.setItem("mainta_user", JSON.stringify(userObj));
            window.dispatchEvent(new Event('mainta_user_updated'));
          })
          .catch(err => console.error(err));
      }
      
      // Clean up URL
      window.history.replaceState(null, '', '/credits');
      setTimeout(() => setSuccess(false), 5000);
    }
  }, [successParam]);

  const handlePurchase = async (id: number | string, amount: number) => {
    if (amount <= 0) return;
    setLoadingId(id);
    
    const userStr = localStorage.getItem("mainta_user");
    if (!userStr) {
      alert("Please login first");
      setLoadingId(null);
      return;
    }
    const userObj = JSON.parse(userStr);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-checkout-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userObj.id, amount })
      });
      
      if (!res.ok) throw new Error("Failed to create session");
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred connecting to the payment gateway.");
      setLoadingId(null);
    }
  };

  return (
    <div className="container">
      <div className="credits-header">
        <h1>Purchase Service Credits</h1>
        <p>Top up your account with credits to seamlessly book any cleaning or maintenance service. <strong>1 Credit = $1 USD.</strong></p>
      </div>

      {success && (
        <div style={{ background: '#10b981', color: 'white', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '40px', fontWeight: '600' }}>
          🎉 Purchase successful! Your credits have been added to your balance.
        </div>
      )}

      {missing && !success && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '40px', fontWeight: '500' }}>
          You need <strong>{missing}</strong> more credits to complete your booking. Buy a custom amount below or choose a plan.
        </div>
      )}

      <div className="custom-credit-box" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>Custom Amount</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Need an exact amount? Buy custom credits here.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontWeight: 'bold' }}>$</span>
            <input 
              type="number" 
              className="modern-input" 
              style={{ paddingLeft: '28px', width: '150px', margin: 0 }}
              placeholder="Amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
            />
          </div>
          <button 
            className="btn-primary" 
            onClick={() => handlePurchase('custom', parseInt(customAmount) || 0)}
            disabled={loadingId !== null || !customAmount || parseInt(customAmount) <= 0}
          >
            {loadingId === 'custom' ? 'Processing...' : `Buy ${customAmount || 0} Credits`}
          </button>
        </div>
      </div>

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
              onClick={() => handlePurchase(pkg.id, pkg.credits)}
              disabled={loadingId !== null}
            >
              {loadingId === pkg.id ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <div className="credits-container">
      <Suspense fallback={<div className="container" style={{textAlign: 'center', padding: '50px'}}>Loading...</div>}>
        <CreditsContent />
      </Suspense>
    </div>
  );
}
