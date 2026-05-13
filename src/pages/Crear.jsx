import React from 'react';
import OrderForm from '../features/orders/OrderForm';

import { motion } from 'framer-motion';

export default function Crear({ onOrderCreated }) {
  return (
    <motion.div 
      className="page-fade"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <OrderForm onOrderCreated={onOrderCreated} />
    </motion.div>
  );
}
