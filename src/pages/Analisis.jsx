import React from 'react';
import Analytics from '../features/analytics/Analytics';

import { motion } from 'framer-motion';

export default function Analisis({ orders, returns }) {
  return (
    <motion.div 
      className="page-fade"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Analytics orders={orders} returns={returns} />
    </motion.div>
  );
}
