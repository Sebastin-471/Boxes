import React from 'react';
import { User, Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
  return (
    <header className="header-sticky" style={{ 
      padding: '20px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      borderBottom: '1px solid var(--surface-border)',
      background: 'var(--bg-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onMenuClick}
          className="btn-icon"
          style={{ background: 'none', border: 'none', color: 'white', padding: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pedidos Cajas</h1>
      </div>
      <button aria-label="Perfil de usuario" className="glass btn-profile" style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--surface-color)',
        border: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer'
      }}>
        <User size={20} />
      </button>
    </header>
  );
}
