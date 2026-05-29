"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeaderNav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [creditBalance, setCreditBalance] = useState(0);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("mainta_token");
    const userStr = localStorage.getItem("mainta_user");
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        setUserName(user.firstName || "User");
        setCreditBalance(user.creditBalance || 0);
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mainta_token");
    localStorage.removeItem("mainta_user");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? "✕" : "☰"}
      </button>
      <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
        <Link href="/book/cleaning" className="nav-link" onClick={closeMenu}>Book Service</Link>
        <Link href="/credits" className="nav-link" onClick={closeMenu}>Buy Credits</Link>
        
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</Link>
            <Link href="/profile" className="nav-link" onClick={closeMenu}>Profile</Link>
            <div className="credits-badge">
              <span>💎 {creditBalance} Credits</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--secondary-color)', marginLeft: '16px' }}>
              Hi, {userName}
            </span>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem', marginLeft: '8px' }}>
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/auth/login" className="btn-primary" style={{ padding: '10px 24px', fontSize: '1rem' }} onClick={closeMenu}>
            Sign In
          </Link>
        )}
      </nav>
    </>
  );
}
