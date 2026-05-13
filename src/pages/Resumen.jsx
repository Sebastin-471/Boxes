import React from 'react';
import Dashboard from '../features/dashboard/Dashboard';
import OrderList from '../features/orders/OrderList';

import { motion } from 'framer-motion';

export default function Resumen({ orders, returns, onOrderClick, loading, onTabNavigate }) {
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED').slice(0, 3);

  return (
    <motion.div 
      className="view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Dashboard orders={orders} returns={returns} onTabNavigate={onTabNavigate} />
      
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="section-title" style={{ marginBottom: 0 }}>Pedidos Recientes</h3>
          <button 
            onClick={() => onTabNavigate('dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Ver todos
          </button>
        </div>
        
        <OrderList 
          orders={activeOrders} 
          onOrderClick={onOrderClick} 
          title="" 
          loading={loading} 
        />
      </div>
    </motion.div>
  );
}
