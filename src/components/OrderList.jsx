import React, { useState } from 'react';
import { Package, Truck, ChevronRight, Box } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { getBoxLabel } from '../lib/boxMapping';

const STATUS_FILTERS = ['Todos', 'Pendiente', 'Preparando', 'Listos'];

const STATUS_DISPLAY = {
  'CREATED': { label: 'Pendiente', color: '#a78bfa' },
  'PREPARING': { label: 'En curso', color: '#f59e0b' },
  'READY': { label: 'Listo', color: '#60a5fa' },
  'DELIVERED': { label: 'Entregado', color: 'var(--accent-success)' }
};

export default function OrderList({ orders, onOrderClick, title, loading }) {
  const [activeFilter, setActiveFilter] = useState('Todos');

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Pendiente') return order.status === 'CREATED';
    if (activeFilter === 'Preparando') return order.status === 'PREPARING';
    if (activeFilter === 'Listos') return order.status === 'READY';
    return false;
  });

  const renderOrderCard = (order, idx) => {
    const totalItems = (order.items || []).reduce((acc, item) => acc + item.quantity, 0);
    const statusInfo = STATUS_DISPLAY[order.status] || STATUS_DISPLAY['CREATED'];
    
    return (
      <motion.div 
        key={order.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="card-glass" 
        onClick={() => onOrderClick(order)}
        style={{ cursor: 'pointer', marginBottom: '0' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{order.client_name}</h3>
          <span className="badge-status" style={{ 
            background: `${statusInfo.color}22`, 
            color: statusInfo.color 
          }}>
            {statusInfo.label}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            <Truck size={14} />
            <span>
              {order.status === 'DELIVERED' 
                ? `Entregado por: ${order.delivered_by || '?'}`
                : `Creado: ${format(new Date(order.created_at), "d MMM, h:mm aa", { locale: es })}`
              }
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            <Package size={14} />
            <span>{totalItems} cajas</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderHistoryGroups = () => {
    const groups = [];
    let currentDateStr = null;
    let currentGroup = [];

    filteredOrders.forEach(order => {
      const dateObj = new Date(order.delivery_date || order.created_at);
      const dateStr = format(dateObj, "d 'de' MMMM", { locale: es });
      
      if (dateStr !== currentDateStr) {
        if (currentGroup.length > 0) {
          groups.push({ dateStr: currentDateStr, orders: currentGroup });
        }
        currentDateStr = dateStr;
        currentGroup = [order];
      } else {
        currentGroup.push(order);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ dateStr: currentDateStr, orders: currentGroup });
    }

    return groups.map((group) => (
      <div key={group.dateStr} style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '12px', paddingBottom: '4px', borderBottom: '1px solid var(--surface-border)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {group.dateStr}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {group.orders.map((order, idx) => renderOrderCard(order, idx))}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="view-container">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '24px' }}>{title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card-glass skeleton" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '16px' }}>{title}</h2>
        
        {title === 'Pedidos Activos' && (
          <div className="chip-container">
            {STATUS_FILTERS.map(filter => (
              <button 
                key={filter} 
                className={`chip ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {filteredOrders.length > 0 ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            {title === 'Historial' 
              ? renderHistoryGroups() 
              : filteredOrders.map((order, idx) => renderOrderCard(order, idx))
            }
          </motion.div>
        ) : (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="empty-state"
          >
            <div className="empty-icon">
              <Box size={40} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>No hay pedidos</h3>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.95rem' }}>Aún no hay pedidos activos en esta categoría.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
