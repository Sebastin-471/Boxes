import React from 'react';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', onClick, style = {}, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-glass ${className}`}
      onClick={onClick}
      style={{
        ...style,
        cursor: onClick ? 'pointer' : 'default'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
