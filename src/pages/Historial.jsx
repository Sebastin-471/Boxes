import React from 'react';
import OrderList from '../features/orders/OrderList';
import { motion } from 'framer-motion';
import PullToRefresh from '../components/common/PullToRefresh';

export default function Historial({ orders, onOrderClick, loading, refetch }) {
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  return (
    <motion.div 
      className="page-fade"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <PullToRefresh onRefresh={refetch}>
        <OrderList 
          orders={deliveredOrders} 
          onOrderClick={onOrderClick} 
          title="Historial" 
          loading={loading} 
        />
      </PullToRefresh>
    </motion.div>
  );
}
