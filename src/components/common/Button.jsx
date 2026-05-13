import React from 'react';

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
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary': return { background: 'var(--accent-primary)' };
      case 'secondary': return { background: 'var(--surface-color)' };
      case 'warning': return { background: '#f59e0b' };
      case 'danger': return { background: '#ef4444' };
      case 'ghost': return { background: 'none', border: '1px solid var(--surface-border)' };
      default: return {};
    }
  };

  return (
    <button
      className={`btn-${variant === 'primary' ? 'submit' : 'nav'} ${className}`}
      style={getVariantStyle()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="spinner-small" />
      ) : (
        <>
          {Icon && <Icon size={20} />}
          {children}
        </>
      )}
    </button>
  );
}
