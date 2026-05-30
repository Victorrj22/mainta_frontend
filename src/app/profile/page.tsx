"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./profile.css";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: ""
  });

  const [addresses, setAddresses] = useState<any[]>([]);
  
  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: ""
  });

  useEffect(() => {
    const userStr = localStorage.getItem("mainta_user");
    if (!userStr) {
      router.push("/auth/login");
      return;
    }
    
    const userObj = JSON.parse(userStr);
    if (!userObj.id) {
      localStorage.removeItem("mainta_user");
      localStorage.removeItem("mainta_token");
      router.push("/auth/login");
      return;
    }

    setUserId(userObj.id);
    // Pre-fill from local storage immediately so the user sees something
    setFormData(prev => ({
      ...prev,
      firstName: userObj.firstName || "",
      lastName: userObj.lastName || ""
    }));

    const fetchProfileData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userObj.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            email: data.email || ""
          });
          setAddresses(data.addresses || []);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updatedData = await res.json();
        
        const userStr = localStorage.getItem("mainta_user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          userObj.firstName = updatedData.firstName;
          userObj.lastName = updatedData.lastName;
          localStorage.setItem("mainta_user", JSON.stringify(userObj));
        }

        alert("Profile updated successfully!");
        window.location.reload(); 
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      alert("Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAddress(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          ...newAddress,
          isDefault: addresses.length === 0
        })
      });
      
      if (res.ok) {
        const added = await res.json();
        setAddresses([...addresses, added]);
        setShowAddressForm(false);
        setNewAddress({ street: "", city: "", state: "", zipCode: "" });
      } else {
        alert("Failed to add address.");
      }
    } catch(err) {
      alert("Error adding address");
    } finally {
      setAddingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/addresses/${addressId}/default`, {
        method: "PUT"
      });
      if (res.ok) {
        setAddresses(addresses.map(a => ({
          ...a,
          isDefault: a.id === addressId
        })));
      } else {
        alert("Failed to set default address.");
      }
    } catch(err) {
      alert("Error setting default address.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-layout">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Update your personal information and manage your addresses.</p>
        </div>

        <div className="profile-grid">
          {/* Profile Details Card */}
          <div className="profile-card">
            <h3>Personal Information</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="input-box">
                <label>First Name</label>
                <input 
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required 
                  maxLength={100}
                />
              </div>
              <div className="input-box">
                <label>Last Name</label>
                <input 
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required 
                  maxLength={100}
                />
              </div>
              <div className="input-box">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder={loading ? "Loading..." : ""}
                  maxLength={20}
                />
              </div>
              <div className="input-box">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
                  placeholder={loading ? "Loading..." : ""}
                  maxLength={255}
                />
                <small style={{ color: 'var(--text-muted)' }}>Email cannot be changed.</small>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '16px' }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>

          {/* Addresses Card */}
          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <h3 style={{ margin: 0, border: 'none', padding: 0 }}>Saved Addresses</h3>
              {!showAddressForm && (
                <button onClick={() => setShowAddressForm(true)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                  + Add Address
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} style={{ marginBottom: '24px', padding: '16px', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div className="input-box">
                  <label>Street Address</label>
                  <input type="text" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} maxLength={255} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-box">
                    <label>City</label>
                    <input type="text" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} maxLength={100} />
                  </div>
                  <div className="input-box">
                    <label>State</label>
                    <input type="text" required value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} maxLength={50} />
                  </div>
                </div>
                <div className="input-box">
                  <label>ZIP Code</label>
                  <input type="text" required value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} maxLength={10} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="submit" className="btn-primary" disabled={addingAddress} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    {addingAddress ? "Saving..." : "Save Address"}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAddressForm(false)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div className="loader-container" style={{ minHeight: '100px' }}>
                <div className="loader" style={{ width: '24px', height: '24px', borderWidth: '3px' }}></div>
              </div>
            ) : addresses.length === 0 && !showAddressForm ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <p>You haven't saved any addresses yet.</p>
              </div>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="address-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="address-street">{addr.street} {addr.isDefault && <span style={{ fontSize: '0.75rem', background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '10px', marginLeft: '8px' }}>Default</span>}</div>
                    <div className="address-details">{addr.city}, {addr.state} {addr.zipCode}</div>
                  </div>
                  {!addr.isDefault && (
                    <button 
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    >
                      Set Default
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
