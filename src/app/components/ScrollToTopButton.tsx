"use client";

import React from "react";

export default function ScrollToTopButton() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          background: '#fff',
          border: 'none',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          width: '25px',
          height: '25px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          color: '#d32f2f',
          transition: 'background 0.2s',
        }}
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}