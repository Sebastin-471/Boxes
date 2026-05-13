import React from 'react';
import { LayoutDashboard, Package, PlusCircle, RotateCcw } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Pedidos', icon: Package },
    { id: 'new', label: 'Crear', icon: PlusCircle },
    { id: 'returns', label: 'Devolver', icon: RotateCcw, color: '#f59e0b' }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
        >
          <tab.icon 
            size={20} 
            style={{ 
              color: activeTab === tab.id 
                ? (tab.color || 'var(--accent-primary)') 
                : 'var(--text-tertiary)' 
            }} 
          />
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
