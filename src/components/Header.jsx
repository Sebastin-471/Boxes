import React from 'react';
import { User } from 'lucide-react';

export default function Header() {
  return (
    <header style={{ 
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
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Pedidos Cajas</h1>
      <button aria-label="Perfil de usuario" className="glass" style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--surface-color)',
        border: 'none',
        color: 'var(--text-primary)'
      }}>
        <User size={20} />
      </button>
    </header>
  );
}
