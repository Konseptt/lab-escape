"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#131312",
          color: "#e8e6e3",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <p style={{ fontSize: "0.6875rem", letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.6 }}>
            Facility error
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 500, marginTop: "0.75rem" }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.6, opacity: 0.75, fontSize: "0.875rem" }}>
            An unexpected error occurred. Your local session data in the browser is unaffected.
          </p>
          {error.digest ? (
            <p style={{ marginTop: "1rem", fontFamily: "monospace", fontSize: "0.6875rem", opacity: 0.5 }}>
              Ref: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              background: "#d97706",
              color: "#131312",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
