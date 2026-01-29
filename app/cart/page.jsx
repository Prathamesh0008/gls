"use client";

import { useEffect, useState } from "react";

function getCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
}
function setCart(items) {
  localStorage.setItem("cart", JSON.stringify(items));
}

export default function Cart() {
  const [cart, setCartState] = useState([]);

  useEffect(() => {
    setCartState(getCart());
  }, []);

  function inc(id) {
    const next = cart.map((c) => (c.productId === id ? { ...c, qty: c.qty + 1 } : c));
    setCart(next); setCartState(next);
  }
  function dec(id) {
    const next = cart
      .map((c) => (c.productId === id ? { ...c, qty: Math.max(1, c.qty - 1) } : c));
    setCart(next); setCartState(next);
  }
  function remove(id) {
    const next = cart.filter((c) => c.productId !== id);
    setCart(next); setCartState(next);
  }

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>Cart is empty. <a href="/">Shop</a></p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {cart.map((c) => (
              <div key={c.productId} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Product ID: {c.productId}</div>
                  <div>Qty: {c.qty}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => dec(c.productId)}>-</button>
                  <button onClick={() => inc(c.productId)}>+</button>
                  <button onClick={() => remove(c.productId)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <a href="/checkout">Go to Checkout →</a>
          </div>
        </>
      )}
    </div>
  );
}
