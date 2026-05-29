"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import "../book.css";

export default function BookCleaning() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceType: "Building Cleaning",
    sidewalk: 0,
    lobby: 0,
    hallways: 0,
    bathrooms: 0,
    internalStaircase: 0,
    externalStaircase: 0,
    laundryRoom: 0,
    dirtLevel: "Standard",
    address: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Calculate dynamic credits based on quantity selected
  const totalCredits = useMemo(() => {
    let total = 0;
    // Base cost for service type
    total += 1; 
    // Add units
    total += bookingData.sidewalk;
    total += bookingData.lobby;
    total += bookingData.hallways;
    total += bookingData.bathrooms;
    total += bookingData.internalStaircase;
    total += bookingData.externalStaircase;
    total += bookingData.laundryRoom;
    // Multiplier for dirt level
    if (bookingData.dirtLevel === "Deep Clean") total += 2;
    if (bookingData.dirtLevel === "Post-Construction") total += 5;
    return total > 0 ? total : 1;
  }, [bookingData]);

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleBook = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  const updateField = (field: string, value: any) => {
    setBookingData({ ...bookingData, [field]: value });
  };

  if (success) {
    return (
      <div className="book-container success-container">
        <div className="book-card text-center">
          <div className="success-icon">🎉</div>
          <h1>Booking Confirmed!</h1>
          <p>Your premium cleaning service is scheduled for {bookingData.date || "your selected date"}.</p>
          <p className="credit-deducted">-{totalCredits} Credits Deducted</p>
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
                <h2>Select Property Details</h2>
                
                <div className="input-box">
                  <label>Service Type</label>
                  <select className="modern-select" value={bookingData.serviceType} onChange={e => updateField('serviceType', e.target.value)}>
                    <option>Building Cleaning</option>
                    <option>Residential Cleaning</option>
                    <option>Commercial Office</option>
                  </select>
                </div>

                <div className="grid-2">
                  <div className="input-box">
                    <label>Sidewalk (1 credit/unit)</label>
                    <select className="modern-select" value={bookingData.sidewalk} onChange={e => updateField('sidewalk', parseInt(e.target.value))}>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="input-box">
                    <label>Lobby (1 credit/unit)</label>
                    <select className="modern-select" value={bookingData.lobby} onChange={e => updateField('lobby', parseInt(e.target.value))}>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="input-box">
                    <label>Hallways (1 credit/unit)</label>
                    <select className="modern-select" value={bookingData.hallways} onChange={e => updateField('hallways', parseInt(e.target.value))}>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="input-box">
                    <label>Building Bathroom (1 credit/unit)</label>
                    <select className="modern-select" value={bookingData.bathrooms} onChange={e => updateField('bathrooms', parseInt(e.target.value))}>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="input-box">
                    <label>Internal Staircase (1 credit/unit)</label>
                    <select className="modern-select" value={bookingData.internalStaircase} onChange={e => updateField('internalStaircase', parseInt(e.target.value))}>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="input-box">
                    <label>External Staircase (1 credit/unit)</label>
                    <select className="modern-select" value={bookingData.externalStaircase} onChange={e => updateField('externalStaircase', parseInt(e.target.value))}>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="input-box">
                    <label>Laundry Room (1 credit/unit)</label>
                    <select className="modern-select" value={bookingData.laundryRoom} onChange={e => updateField('laundryRoom', parseInt(e.target.value))}>
                      {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-box">
                  <label>Dirt Level <span style={{color: 'red'}}>*</span></label>
                  <select className="modern-select" value={bookingData.dirtLevel} onChange={e => updateField('dirtLevel', e.target.value)}>
                    <option>Standard</option>
                    <option>Deep Clean</option>
                    <option>Post-Construction</option>
                  </select>
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
                    onChange={e => updateField('address', e.target.value)}
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
                <div className="input-box">
                  <label>Select Date</label>
                  <input 
                    type="date" 
                    className="modern-input"
                    value={bookingData.date}
                    onChange={e => updateField('date', e.target.value)}
                  />
                </div>
                
                <div className="payment-summary">
                  <h3>Payment</h3>
                  <div className="payment-row">
                    <span>{bookingData.serviceType} Base</span>
                    <span>1 Credit</span>
                  </div>
                  {bookingData.sidewalk > 0 && <div className="payment-row"><span>Sidewalk ({bookingData.sidewalk})</span><span>{bookingData.sidewalk} Credits</span></div>}
                  {bookingData.lobby > 0 && <div className="payment-row"><span>Lobby ({bookingData.lobby})</span><span>{bookingData.lobby} Credits</span></div>}
                  {bookingData.hallways > 0 && <div className="payment-row"><span>Hallways ({bookingData.hallways})</span><span>{bookingData.hallways} Credits</span></div>}
                  {bookingData.bathrooms > 0 && <div className="payment-row"><span>Bathrooms ({bookingData.bathrooms})</span><span>{bookingData.bathrooms} Credits</span></div>}
                  {bookingData.internalStaircase > 0 && <div className="payment-row"><span>Internal Staircase ({bookingData.internalStaircase})</span><span>{bookingData.internalStaircase} Credits</span></div>}
                  {bookingData.externalStaircase > 0 && <div className="payment-row"><span>External Staircase ({bookingData.externalStaircase})</span><span>{bookingData.externalStaircase} Credits</span></div>}
                  {bookingData.laundryRoom > 0 && <div className="payment-row"><span>Laundry Room ({bookingData.laundryRoom})</span><span>{bookingData.laundryRoom} Credits</span></div>}
                  {bookingData.dirtLevel !== "Standard" && <div className="payment-row"><span>{bookingData.dirtLevel} Add-on</span><span>{bookingData.dirtLevel === "Deep Clean" ? 2 : 5} Credits</span></div>}

                  <div className="payment-row total">
                    <span>Total Due</span>
                    <span>{totalCredits} {totalCredits === 1 ? 'Credit' : 'Credits'}</span>
                  </div>
                  <div style={{ clear: 'both', overflow: 'hidden' }}>
                    <div className="balance-info">Your current balance: <strong>10 Credits</strong></div>
                  </div>
                </div>

                <div className="btn-row">
                  <button className="btn-secondary" onClick={handlePrev}>Back</button>
                  <button className="btn-primary w-full" onClick={handleBook} disabled={loading}>
                    {loading ? "Confirming..." : `Confirm & Pay ${totalCredits} Credits`}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>

        <div className="book-sidebar hidden-mobile">
          <div className="summary-card">
            <img src="/cleaning.png" alt="Cleaning Service" className="summary-img" />
            <div className="summary-details">
              <h3>{bookingData.serviceType}</h3>
              <p>Dirt Level: {bookingData.dirtLevel}</p>
              
              <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />
              
              <div className="summary-row">
                <span>Address</span>
                <span style={{ textAlign: 'right' }}>{bookingData.address || "Not selected"}</span>
              </div>
              
              <div className="summary-total">
                <span>Total Cost</span>
                <span className="text-primary">{totalCredits} {totalCredits === 1 ? 'Credit' : 'Credits'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
