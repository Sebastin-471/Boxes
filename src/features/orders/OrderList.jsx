import React, { useState } from 'react';
import { Package, Truck, Search, Box } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

const STATUS_FILTERS = ['Todos', 'Pendiente', 'Preparando', 'Listos'];

const STATUS_DISPLAY = {
  'CREATED': { label: 'Pendiente', color: '#a78bfa' },
  'PREPARING': { label: 'En curso', color: '#f59e0b' },
  'READY': { label: 'Listo', color: '#60a5fa' },
  'DELIVERED': { label: 'Entregado', color: 'var(--accent-success)' }
};

export default function OrderList({ orders, onOrderClick, title, loading }) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => {
    const matchesFilter = 
      activeFilter === 'Todos' ||
      (activeFilter === 'Pendiente' && order.status === 'CREATED') ||
      (activeFilter === 'Preparando' && order.status === 'PREPARING') ||
      (activeFilter === 'Listos' && order.status === 'READY');
    
    const matchesSearch = order.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const renderOrderCard = (order, idx) => {
    const totalItems = (order.items || []).reduce((acc, item) => acc + item.quantity, 0);
    const statusInfo = STATUS_DISPLAY[order.status] || STATUS_DISPLAY['CREATED'];
    
    return (
      <Card 
        key={order.id}
        idx={idx}
        onClick={() => onOrderClick(order)}
        style={{ marginBottom: '0' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{order.client_name}</h3>
          <Badge color={statusInfo.color}>{statusInfo.label}</Badge>
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
      </Card>
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
        <h4 className="section-divider">
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
        <h2 className="view-title">{title}</h2>
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
        <h2 className="view-title" style={{ marginBottom: '16px' }}>{title}</h2>
        
        {/* Search Bar */}
        <div className="search-container" style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} className="search-icon" style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-tertiary)' }} />
          <input 
            className="custom-input" 
            placeholder="Buscar cliente..." 
            style={{ paddingLeft: '48px', marginBottom: 0 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
