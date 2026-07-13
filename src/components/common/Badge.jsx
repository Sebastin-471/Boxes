import React from 'react';
import { CircleDot, Check, Sparkles } from 'lucide-react';

export default function Badge({ children, color = 'var(--accent-primary)', style = {}, ...props }) {
  let Icon = Sparkles;
  let sealColor = color;

  const textLower = String(children).toLowerCase();
  
  if (textLower.includes('pendiente')) {
    Icon = CircleDot;
    sealColor = 'var(--accent-warning)'; // Terracota
  } else if (textLower.includes('listo')) {
    Icon = Sparkles;
    sealColor = 'var(--accent-primary)'; // Foil
  } else if (textLower.includes('entregado')) {
    Icon = Check;
    sealColor = 'var(--accent-success)'; // Eucalipto
  } else if (textLower.includes('cancelado') || textLower.includes('devuelto')) {
    Icon = CircleDot;
    sealColor = 'var(--accent-error)'; // Rosa
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }} {...props}>
      <div 
        className="seal"
        style={{ color: sealColor }}
        title={String(children)}
      >
        <Icon size={14} strokeWidth={2.5} />
      </div>
      <span className="badge-status" style={{ color: sealColor, padding: 0 }}>
        {children}
      </span>
    </div>
  );
}
