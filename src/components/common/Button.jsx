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
      background: 'var(--accent-primary)', 
      color: 'var(--bg-color)',
      boxShadow: '0 4px 16px var(--accent-primary-soft)'
    },
    secondary: { 
      background: 'var(--surface-color)', 
      color: 'var(--text-secondary)',
      border: '1px solid var(--surface-border)'
    },
    warning: { 
      background: 'var(--accent-warning)', 
      color: 'var(--bg-color)',
      boxShadow: '0 4px 16px var(--accent-warning-soft)'
    },
    danger: { 
      background: 'none', 
      color: 'var(--accent-error)',
      border: '1px solid var(--accent-error-soft)'
    },
    ghost: { 
      background: 'none', 
      color: 'var(--text-secondary)',
      border: '1px solid var(--surface-border)'
    },
    success: {
      background: 'var(--accent-success)',
      color: 'var(--bg-color)',
      boxShadow: '0 4px 16px var(--accent-success-soft)'
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
