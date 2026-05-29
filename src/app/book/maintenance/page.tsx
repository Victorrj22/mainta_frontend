"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "../book.css";

export default function BookMaintenance() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    issueType: "Plumbing",
    description: "",
    address: "",
    date: "",
    time: "",
    contactPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("mainta_user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      fetch(`http://localhost:5175/api/users/${userObj.id}`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          const defaultAddr = data.addresses?.find((a: any) => a.isDefault);
          setBookingData(prev => ({
            ...prev,
            contactPhone: prev.contactPhone || data.phone || "",
            address: prev.address || (defaultAddr ? `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.zipCode}` : ""),
            addressId: (prev as any).addressId || (defaultAddr ? defaultAddr.id : (data.addresses?.length > 0 ? data.addresses[0].id : undefined))
          }));
        })
        .catch(err => console.error("Failed to load user", err));
    }
  }, []);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const getCaliforniaDateString = () => {
    return new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' 
    }).format(new Date());
  };
  
  const getCaliforniaTimeString = () => {
    return new Intl.DateTimeFormat('en-GB', { 
      timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: false 
    }).format(new Date());
  };

  const minDateStr = getCaliforniaDateString();
  const minTimeStr = bookingData.date === minDateStr ? getCaliforniaTimeString() : "";

  const handleBook = async () => {
    if (!user) return;
    
    if (!bookingData.address || bookingData.address.trim() === "") {
      setErrorMsg("Please provide a valid address (return to the previous step).");
      return;
    }
    if (!bookingData.contactPhone || bookingData.contactPhone.trim() === "") {
      setErrorMsg("Please provide a contact phone number.");
      return;
    }
    if (!bookingData.date || !bookingData.time) {
      setErrorMsg("Please select a date and time.");
      return;
    }
    const currentCaDate = getCaliforniaDateString();
    if (bookingData.date < currentCaDate) {
      setErrorMsg("The selected date cannot be in the past (California Time).");
      return;
    }
    if (bookingData.date === currentCaDate && bookingData.time < getCaliforniaTimeString()) {
      setErrorMsg("The selected time cannot be in the past (California Time).");
      return;
    }
    if (user.creditBalance < 1) {
      setErrorMsg(`Insufficient balance: You have ${user.creditBalance} Credits, but 1 Credit is required to request a quote.`);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const bookingPayload = {
      userId: user.id,
      addressId: (bookingData as any).addressId || "00000000-0000-0000-0000-000000000000",
      serviceId: "00000000-0000-0000-0000-000000000000",
      detailsJson: JSON.stringify(bookingData),
      scheduledDate: new Date(`${bookingData.date}T${bookingData.time}`).toISOString(),
      totalPrice: 1
    };

    try {
      const res = await fetch("http://localhost:5175/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const text = await res.text();
        setErrorMsg(text || "Error creating request.");
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="book-container success-container">
        <div className="book-card text-center">
          <div className="success-icon">🛠️</div>
          <h1>Quote Requested!</h1>
          <p>We've received your maintenance request. We will review and deduct 1 Credit once the provider is dispatched.</p>
          <Link href="/" className="btn-primary" style={{ marginTop: '24px' }}>Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="book-container">
      <div className="book-layout">
        
        <div className="book-content">
          <div className="book-card">
            <div className="step-indicator">Step {step} of 3</div>
            
            {step === 1 && (
              <div className="step-content">
                <h2>What do you need help with?</h2>
                
                <div className="input-box">
                  <label>Type of Maintenance</label>
                  <select 
                    className="modern-select"
                    value={bookingData.issueType} 
                    onChange={e => setBookingData({...bookingData, issueType: e.target.value})}
                  >
                    <option>Plumbing</option>
                    <option>Electrical</option>
                    <option>HVAC</option>
                    <option>Appliance Repair</option>
                    <option>General Handyman</option>
                  </select>
                </div>

                <div className="input-box">
                  <label>Describe the issue (optional)</label>
                  <textarea 
                    className="modern-textarea"
                    placeholder="E.g., The sink in the master bathroom is leaking..."
                    value={bookingData.description}
                    onChange={e => setBookingData({...bookingData, description: e.target.value})}
                  />
                </div>
                
                <div className="btn-row">
                  <button className="btn-primary" onClick={handleNext}>Continue to Address</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <h2>Where do you need us?</h2>
                <div className="input-box">
                  <label>Service Address (California Only)</label>
                  <input 
                    type="text" 
                    className="modern-input"
                    placeholder="e.g. 123 Main St, Los Angeles, CA 90001" 
                    value={bookingData.address}
                    onChange={e => setBookingData({...bookingData, address: e.target.value})}
                  />
                </div>
                {/* Mock Map View inspired by Hotels app */}
                <div className="map-placeholder">
                  <div className="map-pin">📍</div>
                  <p>Mapbox / Google Maps Integration goes here</p>
                </div>
                
                <div className="btn-row">
                  <button className="btn-secondary" onClick={handlePrev}>Back</button>
                  <button className="btn-primary" onClick={handleNext}>Continue to Schedule</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <h2>Choose a Date & Time</h2>
                <div className="grid-2">
                  <div className="input-box">
                    <label>Preferred Date</label>
                    <input 
                      type="date" 
                      className="modern-input"
                      value={bookingData.date}
                      min={minDateStr}
                      onChange={e => setBookingData({...bookingData, date: e.target.value})}
                    />
                  </div>
                  <div className="input-box">
                    <label>Preferred Time</label>
                    <input 
                      type="time" 
                      className="modern-input"
                      value={bookingData.time}
                      min={minTimeStr}
                      onChange={e => setBookingData({...bookingData, time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="input-box">
                  <label>Contact Phone</label>
                  <input 
                    type="tel" 
                    className="modern-input"
                    placeholder="(555) 555-5555"
                    value={bookingData.contactPhone}
                    onChange={e => setBookingData({...bookingData, contactPhone: e.target.value})}
                  />
                </div>
                
                <div className="payment-summary">
                  <h3>Payment Pre-Authorization</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Maintenance requires a quote. We will pre-authorize 1 Credit, but it will only be deducted if you accept the quote.
                  </p>
                  <div className="payment-row total">
                    <span>Pre-Authorization</span>
                    <span>1 Credit</span>
                  </div>
                  <p className="balance-info">Your current balance: <strong>{user ? user.creditBalance : "..."} Credits</strong></p>
                </div>

                {errorMsg && <div style={{ color: 'red', marginTop: '12px', textAlign: 'center', fontWeight: 'bold' }}>{errorMsg}</div>}

                <div className="btn-row" style={{ marginTop: '16px' }}>
                  <button className="btn-secondary" onClick={handlePrev}>Back</button>
                  <button className="btn-primary w-full" onClick={handleBook} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>

        <div className="book-sidebar hidden-mobile">
          <div className="summary-card">
            <img src="/maintenance.png" alt="Maintenance Service" className="summary-img" />
            <div className="summary-details">
              <h3>Maintenance: {bookingData.issueType}</h3>
              <p>Professional fix for your home issues.</p>
              
              <hr />
              
              <div className="summary-row">
                <span>Address</span>
                <span>{bookingData.address || "Not selected"}</span>
              </div>
              
              <div className="summary-total">
                <span>Total Cost</span>
                <span className="text-primary">1 Credit (Upon Quote Approval)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
