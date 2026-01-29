"use client";
import { useState } from "react";

export default function Register() {
  const [name, setName] = useState("Test User");
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Registering...");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Register failed");
    setMsg("Registered ✅ Now login");
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button style={{ cursor: "pointer" }}>Register</button>
      </form>
      <p>{msg}</p>
      <p>Already have account? <a href="/login">Login</a></p>
    </div>
  );
}
