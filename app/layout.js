"use client";

import "./globals.css";



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", padding: 20 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <a href="/" style={{ fontWeight: 800, textDecoration: "none" }}>Mini Ecom + GLS</a>
            <nav style={{ display: "flex", gap: 12 }}>
              <a href="/cart">Cart</a>
              <a href="/login">Login</a>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("token");
                    window.location.href = "/";
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                Logout
              </button>
            </nav>
          </header>
          <hr style={{ margin: "16px 0" }} />
          {children}
        </div>
      </body>
    </html>
  );
}
