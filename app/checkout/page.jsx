"use client";

import { useEffect, useState } from "react";

function getCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
}

export default function Checkout() {
   

  const [shipping, setShipping] = useState({
    receiverName: "Customer",
    street: "Main Street",
    houseNo: "1",
    zipCode: "1012LG",
    city: "Amsterdam",
    countryCode: "NL",
    weight: 1,
    reference: `ORD-${Date.now()}`,
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "/login";
  }, []);

  async function placeOrder() {
    setMsg("Placing order...");
    const token = localStorage.getItem("token");
    const cartItems = getCart();
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cartItems, shipping }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Order failed");

    localStorage.setItem("cart", "[]");
    window.location.href = `/orders/${data.orderId}`;
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>Checkout</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {Object.keys(shipping).map((k) => (
          <input
            key={k}
            value={shipping[k]}
            onChange={(e) => setShipping((s) => ({ ...s, [k]: e.target.value }))}
            placeholder={k}
          />
        ))}
      </div>
      <button onClick={placeOrder} style={{ marginTop: 12, cursor: "pointer" }}>
        Place Order & Create GLS Label
      </button>
      <p>{msg}</p>
    </div>
  );
}
