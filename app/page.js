"use client";

import { useEffect, useState } from "react";

function getCart() {
  try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
}
function setCart(items) {
  localStorage.setItem("cart", JSON.stringify(items));
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(d => setProducts(d.products || []));
  }, []);

  function addToCart(productId) {
    const cart = getCart();
    const idx = cart.findIndex((x) => x.productId === productId);
    if (idx >= 0) cart[idx].qty += 1;
    else cart.push({ productId, qty: 1 });
    setCart(cart);
    setMsg("Added to cart ✅");
    setTimeout(() => setMsg(""), 1200);
  }

  return (
    <div>
      <h2>10 Random Products</h2>
      {msg && <p>{msg}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {products.map((p) => (
          <div key={p._id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 10 }}>
            <img src={p.image} alt={p.name} style={{ width: "100%", borderRadius: 8 }} />
            <h3 style={{ margin: "10px 0 4px" }}>{p.name}</h3>
            <p style={{ margin: 0 }}>₹ {p.price}</p>
            <button onClick={() => addToCart(p._id)} style={{ marginTop: 10, cursor: "pointer" }}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
