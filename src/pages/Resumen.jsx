import React from 'react';
import Dashboard from '../features/dashboard/Dashboard';
import OrderList from '../features/orders/OrderList';

import { motion } from 'framer-motion';

export default function Resumen({ orders, returns, deliveries, onOrderClick, loading, onTabNavigate }) {
  const activeOrders = orders.filter(o => o.status === 'CREATED' || o.status === 'READY').slice(0, 3);

  return (
    <motion.div 
      className="view-container"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Dashboard orders={orders} returns={returns} deliveries={deliveries} onTabNavigate={onTabNavigate} />
    </motion.div>
  );
}
