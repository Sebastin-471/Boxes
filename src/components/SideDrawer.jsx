import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Settings, LogOut, Package, Info, ChevronRight } from 'lucide-react';

export default function SideDrawer({ isOpen, onClose, onNavigate, activeTab }) {
  const menuItems = [
    { id: 'analytics', label: 'Análisis y Estadísticas', icon: BarChart3, color: '#8b5cf6' },
    { id: 'history', label: 'Historial Completo', icon: Package, color: '#60a5fa' },
  ];

  const secondaryItems = [
    { id: 'about', label: 'Acerca de BoxManager', icon: Info },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '85%',
              maxWidth: '320px',
              background: 'var(--bg-color)',
              borderRight: '1px solid var(--surface-border)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                  B
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>BoxManager</span>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', padding: '4px' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontWeight: 600 }}>
                Menú Principal
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      width: '100%',
                      padding: '14px 16px',
                      background: activeTab === item.id ? 'rgba(139, 92, 246, 0.1)' : 'none',
                      border: 'none',
                      color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <item.icon size={20} color={activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-tertiary)'} />
                    <span style={{ fontWeight: activeTab === item.id ? 600 : 500, flex: 1, textAlign: 'left' }}>{item.label}</span>
                    <ChevronRight size={16} opacity={0.5} />
                  </button>
                ))}
              </div>

              <div style={{ marginTop: '32px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', fontWeight: 600 }}>
                  Sistema
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {secondaryItems.map((item) => (
                    <button
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        width: '100%',
                        padding: '14px 16px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-tertiary)',
                        borderRadius: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <item.icon size={20} />
                      <span style={{ fontWeight: 500, flex: 1, textAlign: 'left' }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} color="#8b5cf6" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>Luis Administrador</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', margin: 0 }}>Gestión de Registros</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
