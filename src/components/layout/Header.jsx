import React from 'react';
import { User, Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  return (
    <header className="header-sticky" style={{
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid var(--surface-border)',
      background: 'rgba(5, 5, 5, 0.88)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onMenuClick}
          className="btn-icon"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.2s'
          }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: 'white'
          }}>
            B
          </div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em' }}>BoxManager</h1>
        </div>
      </div>
      <button aria-label="Perfil de usuario" style={{
        width: '36px',
        height: '36px',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-color)',
        border: '1px solid var(--surface-border)',
        color: 'var(--text-tertiary)',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}>
        <User size={18} />
      </button>
    </header>
  );
}
