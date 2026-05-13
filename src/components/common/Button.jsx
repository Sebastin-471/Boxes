import React from 'react';
import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false, 
  disabled = false, 
  icon: Icon,
  active,
  ...props 
}) {
  const variantStyles = {
    primary: { 
      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', 
      color: 'white',
      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)'
    },
    secondary: { 
      background: 'var(--surface-color)', 
      color: 'var(--text-secondary)',
      border: '1px solid var(--surface-border)'
    },
    warning: { 
      background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
      color: 'white',
      boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
    },
    danger: { 
      background: 'none', 
      color: '#ef4444',
      border: '1px solid rgba(239, 68, 68, 0.25)'
    },
    ghost: { 
      background: 'none', 
      color: 'var(--text-secondary)',
      border: '1px solid var(--surface-border)'
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
    }
  };

  const style = variantStyles[variant] || variantStyles.primary;

  return (
    <motion.button
      className={`btn-submit ${className}`}
      style={{
        ...style,
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled || loading ? 'none' : 'auto',
        ...props.style
      }}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      onClick={props.onClick}
    >
      {loading ? (
        <div className="spinner-small" />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </motion.button>
  );
}
