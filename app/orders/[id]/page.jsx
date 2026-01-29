"use client";

import { useEffect, useState } from "react";
import React from "react";

export default function OrderPage({ params }) {
  // ✅ unwrap params (Next.js 15+)
  const { id } = React.use(params);

  const [order, setOrder] = useState(null);
  const [msg, setMsg] = useState("Loading...");

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`/api/orders?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setMsg(d.message || "Error");
        } else {
          setOrder(d.order);
          setMsg("");
        }
      })
      .catch(() => setMsg("Failed to load order"));
  }, [id]);

  function downloadPdf() {
    if (!order?.glsLabelBase64) return;

    const b64 = order.glsLabelBase64;
    const byteChars = atob(b64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }

    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GLS_LABEL_${order.shipping?.reference || order._id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h2>Order Details</h2>

      {msg && <p>{msg}</p>}

      {order && (
        <>
          <p><b>Reference:</b> {order.shipping?.reference}</p>
          <p><b>Status:</b> {order.status}</p>
          <p><b>Tracking:</b> {order.trackingNumber || "-"}</p>
          <p><b>Total:</b> ₹ {order.totalAmount}</p>

          <button onClick={downloadPdf} style={{ cursor: "pointer" }}>
            Download GLS Label (PDF)
          </button>

          <div style={{ marginTop: 14 }}>
            <a href="/">← Back to Home</a>
          </div>
        </>
      )}
    </div>
  );
}
