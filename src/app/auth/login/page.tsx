"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../auth.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5175";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // In a real app, store token in cookies/context.
        localStorage.setItem("mainta_token", data.token);
        localStorage.setItem("mainta_user", JSON.stringify({ 
          id: data.id,
          firstName: data.firstName, 
          lastName: data.lastName,
          creditBalance: data.creditBalance
        }));
        // Force a hard reload to ensure HeaderNav reads the new localStorage state
        window.location.href = "/dashboard";
      } else {
        const errData = await res.text();
        setError(errData || "Invalid login credentials.");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card auth-card">
        <h1>Welcome Back</h1>
        <p>Sign in to your Mainta account</p>

        {error && <div style={{ color: "red", marginBottom: "16px", fontSize: "0.9rem" }}>{error}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              maxLength={255}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              maxLength={255}
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link href="/auth/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
