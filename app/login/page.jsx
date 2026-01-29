"use client";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("test@test.com");
  const [password, setPassword] = useState("123456");
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("Logging in...");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Login failed");
    localStorage.setItem("token", data.token);
    window.location.href = "/";
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
        <button style={{ cursor: "pointer" }}>Login</button>
      </form>
      <p>{msg}</p>
      <p>New? <a href="/register">Register</a></p>
    </div>
  );
}
