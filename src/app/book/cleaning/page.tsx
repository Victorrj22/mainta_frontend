"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "../book.css";
import { 
  calculateTotalCost, 
  DIRT_LEVELS, 
  SQ_FT_RANGES, 
  BookingDetails, 
  ADDON_PRICES 
} from "../../utils/pricing";

const MapSearch = dynamic(() => import("../../components/MapSearch"), { ssr: false });

export default function BookCleaning() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingDetails & { address: string, addressId: string, date: string, time: string, contactPhone: string }>({
    serviceType: "Deep Cleaning",
    dirtLevel: "Well Maintained",
    sqFtRangeIndex: 0,
    bedrooms: 0,
    fullBathrooms: 0,
    halfBathrooms: 0,
    kitchens: 0,
    hallways: 0,
    sidewalk: 0,
    staircases: 0,
    lobby: 0,
    laundryRoom: 0,
    externalStaircase: 0,
    address: "",
    addressId: "",
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
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userObj.id}`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          const defaultAddr = data.addresses?.find((a: any) => a.isDefault);
          setBookingData(prev => ({
            ...prev,
            contactPhone: prev.contactPhone || data.phone || "",
            address: prev.address || (defaultAddr ? `${defaultAddr.street}, ${defaultAddr.city}, ${defaultAddr.state} ${defaultAddr.zipCode}` : ""),
            addressId: prev.addressId || (defaultAddr ? defaultAddr.id : (data.addresses?.length > 0 ? data.addresses[0].id : ""))
          }));
        })
        .catch(err => console.error("Failed to load user", err));
    }
  }, []);

  const totalCredits = useMemo(() => {
    return calculateTotalCost(bookingData);
  }, [bookingData]);

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
    if (user.creditBalance < totalCredits) {
      setErrorMsg(`Insufficient balance: You have ${user.creditBalance} Credits, but the total is ${totalCredits} Credits.`);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const bookingPayload = {
      userId: user.id,
      addressId: bookingData.addressId || "00000000-0000-0000-0000-000000000000",
      serviceId: "00000000-0000-0000-0000-000000000000",
      detailsJson: JSON.stringify(bookingData),
      scheduledDate: new Date(`${bookingData.date}T${bookingData.time}`).toISOString(),
      totalPrice: totalCredits
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload)
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const text = await res.text();
        setErrorMsg(text || "Error creating booking.");
      }
    } catch (err) {
      setErrorMsg("Connection error.");
    } finally {
      setLoading(false);
    }
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

  const isBuildingCleaning = bookingData.serviceType === "Building Cleaning";
  const isResidential = ["Deep Cleaning", "Move In/Out", "Post Construction"].includes(bookingData.serviceType);
  const isOffice = bookingData.serviceType === "Office Cleaning";

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
                    <option>Deep Cleaning</option>
                    <option>Move In/Out</option>
                    <option>Post Construction</option>
                    <option>Office Cleaning</option>
                    <option>Building Cleaning</option>
                  </select>
                </div>

                {!isBuildingCleaning && (
                  <div className="input-box">
                    <label>Property Size (SQ FT)</label>
                    <select className="modern-select" value={bookingData.sqFtRangeIndex} onChange={e => updateField('sqFtRangeIndex', parseInt(e.target.value))}>
                      {SQ_FT_RANGES.map((range, index) => (
                        <option key={index} value={index}>{range} SQ FT</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid-2">
                  {/* Residential Specific Add-ons */}
                  {isResidential && (
                    <>
                      <div className="input-box">
                        <label>Bedrooms (+{ADDON_PRICES.bedrooms} credits)</label>
                        <select className="modern-select" value={bookingData.bedrooms} onChange={e => updateField('bedrooms', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Full Bathrooms (+{ADDON_PRICES.fullBathrooms} credits)</label>
                        <select className="modern-select" value={bookingData.fullBathrooms} onChange={e => updateField('fullBathrooms', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Half Bathrooms (+{ADDON_PRICES.halfBathrooms} credits)</label>
                        <select className="modern-select" value={bookingData.halfBathrooms} onChange={e => updateField('halfBathrooms', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Office Specific Add-ons */}
                  {isOffice && (
                    <>
                      <div className="input-box">
                        <label>Full Bathrooms (+{ADDON_PRICES.fullBathrooms} credits)</label>
                        <select className="modern-select" value={bookingData.fullBathrooms} onChange={e => updateField('fullBathrooms', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Half Bathrooms (+{ADDON_PRICES.halfBathrooms} credits)</label>
                        <select className="modern-select" value={bookingData.halfBathrooms} onChange={e => updateField('halfBathrooms', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Kitchens (+{ADDON_PRICES.kitchens} credits)</label>
                        <select className="modern-select" value={bookingData.kitchens} onChange={e => updateField('kitchens', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Hallways (+{ADDON_PRICES.hallways} credits)</label>
                        <select className="modern-select" value={bookingData.hallways} onChange={e => updateField('hallways', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Building Cleaning Specific Add-ons */}
                  {isBuildingCleaning && (
                    <>
                      <div className="input-box">
                        <label>Sidewalk Sweeping (+{ADDON_PRICES.sidewalk} cr)</label>
                        <select className="modern-select" value={bookingData.sidewalk} onChange={e => updateField('sidewalk', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Full Bathrooms (+{ADDON_PRICES.fullBathrooms} cr)</label>
                        <select className="modern-select" value={bookingData.fullBathrooms} onChange={e => updateField('fullBathrooms', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Half Bathrooms (+{ADDON_PRICES.halfBathrooms} cr)</label>
                        <select className="modern-select" value={bookingData.halfBathrooms} onChange={e => updateField('halfBathrooms', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Hallways (+{ADDON_PRICES.hallways} cr)</label>
                        <select className="modern-select" value={bookingData.hallways} onChange={e => updateField('hallways', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Staircases (Flights) (+{ADDON_PRICES.staircases} cr)</label>
                        <select className="modern-select" value={bookingData.staircases} onChange={e => updateField('staircases', parseInt(e.target.value))}>
                          {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Lobby (+{ADDON_PRICES.lobby} cr)</label>
                        <select className="modern-select" value={bookingData.lobby} onChange={e => updateField('lobby', parseInt(e.target.value))}>
                          {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>Laundry Room (+{ADDON_PRICES.laundryRoom} cr)</label>
                        <select className="modern-select" value={bookingData.laundryRoom} onChange={e => updateField('laundryRoom', parseInt(e.target.value))}>
                          {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div className="input-box">
                        <label>External Staircases (+{ADDON_PRICES.externalStaircase} cr)</label>
                        <select className="modern-select" value={bookingData.externalStaircase} onChange={e => updateField('externalStaircase', parseInt(e.target.value))}>
                          {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="input-box">
                  <label>Dirt Level <span style={{color: 'red'}}>*</span></label>
                  <select className="modern-select" value={bookingData.dirtLevel} onChange={e => updateField('dirtLevel', e.target.value)}>
                    {DIRT_LEVELS.map(dl => (
                      <option key={dl.label} value={dl.label}>{dl.label}</option>
                    ))}
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
                
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="saved-addresses" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Saved Addresses</label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {user.addresses.map((addr: any) => (
                        <div 
                          key={addr.id}
                          onClick={() => {
                            const fullAddr = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
                            setBookingData(prev => ({ ...prev, address: fullAddr, addressId: addr.id }));
                          }}
                          style={{
                            padding: '12px 16px',
                            border: bookingData.addressId === addr.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: bookingData.addressId === addr.id ? '#eff6ff' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{addr.isDefault ? '🏠' : '📍'}</span>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{addr.street}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{addr.city}, {addr.state}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="input-box">
                  <label>Search Address (California Only)</label>
                  <MapSearch 
                    value={bookingData.address} 
                    onChange={(address) => {
                      setBookingData(prev => ({ ...prev, address: address, addressId: "" }));
                    }} 
                  />
                </div>
                
                <div className="btn-row" style={{ marginTop: '24px' }}>
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
                    <label>Select Date</label>
                    <input 
                      type="date" 
                      className="modern-input"
                      value={bookingData.date}
                      min={minDateStr}
                      onChange={e => updateField('date', e.target.value)}
                    />
                  </div>
                  <div className="input-box">
                    <label>Select Time</label>
                    <input 
                      type="time" 
                      className="modern-input"
                      value={bookingData.time}
                      min={minTimeStr}
                      onChange={e => updateField('time', e.target.value)}
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
                    onChange={e => updateField('contactPhone', e.target.value)}
                  />
                </div>
                
                <div className="payment-summary">
                  <h3>Payment</h3>
                  <div className="payment-row total" style={{ borderTop: 'none', paddingTop: '0' }}>
                    <span>Total Due</span>
                    <span>{totalCredits} {totalCredits === 1 ? 'Credit' : 'Credits'}</span>
                  </div>
                  <div style={{ clear: 'both', overflow: 'hidden' }}>
                    <div className="balance-info">Your current balance: <strong>{user ? user.creditBalance : "..."} Credits</strong></div>
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginTop: '12px', textAlign: 'center', fontSize: '0.95rem' }}>
                    <strong>{errorMsg}</strong>
                    {errorMsg.includes("Insufficient balance") && (
                      <div style={{ marginTop: '8px' }}>
                        <Link href={`/credits?missing=${totalCredits - (user?.creditBalance || 0)}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'inline-block' }}>
                          Buy {totalCredits - (user?.creditBalance || 0)} Credits
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="btn-row" style={{ marginTop: '16px' }}>
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
              {!isBuildingCleaning && <p>Size: {SQ_FT_RANGES[bookingData.sqFtRangeIndex]} SQ FT</p>}
              
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
