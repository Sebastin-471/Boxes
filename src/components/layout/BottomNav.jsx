import React from 'react';
import { LayoutDashboard, Package, PlusCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptics } from '../../utils/haptics';

export default function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Pedidos', icon: Package },
    { id: 'new', label: 'Crear', icon: PlusCircle },
    { id: 'returns', label: 'Devolver', icon: RotateCcw }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            onClick={() => {
              haptics.impact('light');
              onTabChange(tab.id);
            }}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            whileTap={{ scale: 0.88 }}
          >
            <motion.div
              animate={isActive ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <tab.icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  color: isActive
                    ? (tab.id === 'returns' ? 'var(--accent-error)' : 'var(--accent-primary)')
                    : 'var(--text-tertiary)'
                }}
              />
            </motion.div>
            <span style={{
              color: isActive
                ? (tab.id === 'returns' ? 'var(--accent-error)' : 'var(--accent-primary)')
                : 'var(--text-tertiary)',
              letterSpacing: '0.02em'
            }}>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '20px',
                  height: '2px',
                  borderRadius: '1px',
                  background: tab.id === 'returns' ? 'var(--accent-error)' : 'var(--accent-primary)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}
