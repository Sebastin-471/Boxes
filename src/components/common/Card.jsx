import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', onClick, style = {}, idx = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`card-glass ${className}`}
      onClick={onClick}
      style={{
        ...style,
        cursor: onClick ? 'pointer' : 'default'
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
