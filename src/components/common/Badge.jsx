import React from 'react';

export default function Badge({ children, color = 'var(--accent-primary)', style = {}, ...props }) {
  return (
    <span 
      className="badge-status" 
      style={{ 
        background: `${color}22`, 
        color: color,
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
}
