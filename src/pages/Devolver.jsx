import React from 'react';
import ReturnForm from '../features/returns/ReturnForm';

import { motion } from 'framer-motion';

export default function Devolver({ onReturnCreated }) {
  return (
    <motion.div 
      className="page-fade"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <ReturnForm onReturnCreated={onReturnCreated} />
    </motion.div>
  );
}
