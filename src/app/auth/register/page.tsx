"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../auth.css";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5175";
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/auth/login");
      } else {
        const errData = await res.text();
        setError(errData || "Registration failed.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card" style={{ maxWidth: "550px" }}>
        <h1>Create an Account</h1>
        <p>Join Mainta to easily book and manage your home services.</p>

        {error && <div style={{ color: "red", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" value={formData.firstName} onChange={handleChange} required maxLength={100} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" value={formData.lastName} onChange={handleChange} required maxLength={100} />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required maxLength={255} />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (US)</label>
            <input type="tel" id="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required maxLength={255} />
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? "Processing..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/auth/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
