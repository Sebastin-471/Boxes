import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Truck, UserCircle2 } from 'lucide-react';
import { DELIVERERS, computeRemaining } from '../../api/deliveryService';
import { useProducts } from '../../hooks/useProducts';

const fieldLabel = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: 'var(--text-tertiary)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const fieldInput = {
  width: '100%',
  padding: '14px',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--hairline)',
  background: 'var(--surface-hover)',
  color: 'var(--text-primary)',
  fontSize: '1rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'all 0.2s ease',
};

export default function DeliveryForm({ order, deliveries = [], onSubmit, onCancel, loading }) {
  const { getProductLabel } = useProducts();
  
  const remainingItems = useMemo(
    () => computeRemaining(order.items, deliveries),
    [order.items, deliveries]
  );

  const availableItems = remainingItems.filter((r) => r.remaining > 0);
  const totalRemainingBoxes = availableItems.reduce((acc, curr) => acc + curr.remaining, 0);

  // Mode: 'ALL' or 'PARTIAL'
  const [deliveryMode, setDeliveryMode] = useState('ALL');
  const [deliverer, setDeliverer] = useState('');
  const [notes, setNotes] = useState('');
  
  // Partial mode specific state: map of boxType -> quantity string
  const [quantities, setQuantities] = useState({});

  // Helper to handle quantity change
  const handleQuantityChange = (boxType, value, max) => {
    const val = parseInt(value, 10);
    let newValue = value;
    if (!isNaN(val) && val > max) newValue = max.toString();
    if (val < 0) newValue = '';
    
    setQuantities(prev => ({
      ...prev,
      [boxType]: newValue
    }));
  };

  // Validation
  const hasValidPartialQuantity = Object.values(quantities).some(val => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0;
  });
  
  const isValid = deliverer && (deliveryMode === 'ALL' || (deliveryMode === 'PARTIAL' && hasValidPartialQuantity));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid || loading) return;
    
    if (deliveryMode === 'ALL') {
      onSubmit({ mode: 'ALL', deliverer, notes: notes.trim() || null });
    } else {
      // Find all items that have a valid quantity entered
      const partialItems = availableItems
        .map(item => {
          const qty = parseInt(quantities[item.boxType], 10);
          return { boxType: item.boxType, quantity: qty };
        })
        .filter(item => !isNaN(item.quantity) && item.quantity > 0);

      onSubmit({
        mode: 'PARTIAL',
        items: partialItems,
        client_name: order.client_name,
        deliverer,
        notes: notes.trim() || null,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-color)',
          borderRadius: '24px',
          border: '1px solid var(--surface-border)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              Registrar Entrega
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-tertiary)', margin: 0 }}>
              {order.client_name}
            </p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cerrar"
            style={{
              background: 'var(--surface-hover)',
              border: 'none', borderRadius: '50%',
              width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)', cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-border)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Mode Selector */}
          <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-color)', padding: '6px', borderRadius: '16px' }}>
            <button
              type="button"
              onClick={() => setDeliveryMode('ALL')}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                background: deliveryMode === 'ALL' ? 'var(--surface-color)' : 'transparent',
                color: deliveryMode === 'ALL' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                fontWeight: deliveryMode === 'ALL' ? 700 : 500,
                fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: deliveryMode === 'ALL' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Completar Todo
            </button>
            <button
              type="button"
              onClick={() => setDeliveryMode('PARTIAL')}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                background: deliveryMode === 'PARTIAL' ? 'var(--surface-color)' : 'transparent',
                color: deliveryMode === 'PARTIAL' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                fontWeight: deliveryMode === 'PARTIAL' ? 700 : 500,
                fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: deliveryMode === 'PARTIAL' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Entrega Parcial
            </button>
          </div>

          <AnimatePresence mode="wait">
            {deliveryMode === 'ALL' ? (
              <motion.div
                key="all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{
                  background: 'var(--accent-primary-soft)', padding: '16px', borderRadius: '12px',
                  display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-primary)'
                }}>
                  <Package size={24} />
                  <div>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: '0.95rem' }}>
                      Entregar las {totalRemainingBoxes} cajas restantes
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>El pedido se marcará como ENTREGADO.</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="partial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <label style={fieldLabel}>Cantidades a entregar</label>
                {availableItems.map((r) => (
                  <div key={r.boxType} style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', background: 'var(--bg-color)', borderRadius: '12px',
                    border: '1px solid var(--surface-border)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {getProductLabel(r.boxType)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                        Faltan {r.remaining} de {r.total}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={r.remaining}
                      value={quantities[r.boxType] || ''}
                      onChange={(e) => handleQuantityChange(r.boxType, e.target.value, r.remaining)}
                      placeholder="0"
                      style={{
                        ...fieldInput,
                        width: '80px', padding: '8px 12px', textAlign: 'center',
                        background: 'var(--surface-color)'
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deliverer (Grid Layout) */}
          <div>
            <label style={fieldLabel}>¿Quién lo entrega?</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              {DELIVERERS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeliverer(d)}
                  style={{
                    padding: '12px 10px', borderRadius: '12px',
                    border: deliverer === d ? '2px solid var(--accent-primary)' : '2px solid var(--surface-border)',
                    background: deliverer === d ? 'var(--accent-primary-soft)' : 'var(--bg-color)',
                    color: deliverer === d ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: deliverer === d ? 700 : 500, fontSize: '0.9rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                  }}
                >
                  <UserCircle2 size={24} />
                  <span style={{ textAlign: 'center', lineHeight: 1.1 }}>{d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="df-notes" style={fieldLabel}>Notas (opcional)</label>
            <textarea
              id="df-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              placeholder="Observaciones..."
              style={{ ...fieldInput, resize: 'vertical' }}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || !isValid}
            whileTap={{ scale: isValid ? 0.98 : 1 }}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              background: 'var(--accent-primary)',
              color: '#fff',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: loading || !isValid ? 'not-allowed' : 'pointer',
              opacity: loading || !isValid ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: isValid ? '0 8px 24px var(--accent-primary-soft)' : 'none',
              marginTop: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            {loading ? 'Procesando...' : (deliveryMode === 'ALL' ? 'Completar Entrega' : 'Registrar Entrega Parcial')}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

