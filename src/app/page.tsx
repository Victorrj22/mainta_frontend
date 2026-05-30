"use client";

import Link from "next/link";
import "./home.css";

export default function Home() {
  return (
    <div className="home-container">
      <section className="hero-banner">
        {/* Directly using img tag for the background as it behaves better for cover hero without extra next/image setup */}
        <img src="/hero_banner.png" alt="Clean modern home" />
        <div className="hero-content">
          <h1>Cleaning and Household Booking Website</h1>
          <p>Book premium cleaning and maintenance services in seconds using our seamless credit system.</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            <Link href="/book/cleaning" className="btn-primary">
              Book now
            </Link>
            <Link href="/credits" className="btn-secondary">
              Buy Credits
            </Link>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}>
              Choose a service. Use your credits. Enjoy a pristine home. It's that simple.
            </p>
          </div>

          <div className="services-grid">
            <Link href="/book/cleaning" className="service-card">
              <div className="service-image-container">
                <img src="/cleaning.png" alt="Cleaning Service" />
              </div>
              <div className="service-content">
                <h3>Premium Cleaning</h3>
                <p>Top-to-bottom dusting, mopping, and vacuuming. Perfect for regular upkeep of your beautiful California home.</p>
                <div className="book-btn">Schedule Cleaning</div>
              </div>
            </Link>

            <Link href="/book/maintenance" className="service-card">
              <div className="service-image-container">
                <img src="/maintenance.png" alt="Maintenance Service" />
              </div>
              <div className="service-content">
                <h3>Handyman & Maintenance</h3>
                <p>Plumbing, electrical, landscaping, and more. Certified professionals ready to fix any issue.</p>
                <div className="book-btn">Request Quote</div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
