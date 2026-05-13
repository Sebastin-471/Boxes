import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Package, Info, ChevronRight } from 'lucide-react';

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1000
            }}
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: '82%', maxWidth: '300px',
              background: 'var(--bg-color)',
              borderRight: '1px solid var(--surface-border)',
              zIndex: 1001,
              display: 'flex', flexDirection: 'column',
              padding: '24px 20px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '1rem', color: 'white'
                }}>
                  B
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>BoxManager</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)', padding: '6px', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Menu */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px', fontWeight: 600, paddingLeft: '4px' }}>
                Navegación
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`drawer-item ${activeTab === item.id ? 'active' : ''}`}
                  >
                    <div style={{
                      width: '36px', height: '36px',
                      background: activeTab === item.id ? `${item.color}20` : 'var(--surface-color)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <item.icon size={18} color={activeTab === item.id ? item.color : 'var(--text-tertiary)'} />
                    </div>
                    <span style={{ fontWeight: activeTab === item.id ? 600 : 400, flex: 1, textAlign: 'left' }}>{item.label}</span>
                    <ChevronRight size={14} style={{ opacity: 0.3 }} />
                  </motion.button>
                ))}
              </div>

              <div style={{ marginTop: '32px' }}>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px', fontWeight: 600, paddingLeft: '4px' }}>
                  Sistema
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {secondaryItems.map((item) => (
                    <motion.button
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      className="drawer-item"
                    >
                      <div style={{
                        width: '36px', height: '36px',
                        background: 'var(--surface-color)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <item.icon size={18} color="var(--text-tertiary)" />
                      </div>
                      <span style={{ fontWeight: 400, flex: 1, textAlign: 'left' }}>{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--surface-color), var(--surface-hover))',
                border: '1px solid var(--surface-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Package size={18} color="var(--accent-primary)" />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Luis Administrador</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', margin: 0 }}>Gestión de Registros</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
