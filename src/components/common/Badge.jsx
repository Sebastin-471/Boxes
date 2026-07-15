import React from 'react';
import { CircleDot, Check, Sparkles } from 'lucide-react';

export default function Badge({ children, color = 'var(--accent-primary)', style = {}, ...props }) {
  let Icon = Sparkles;
  let sealColor = color;

  const textLower = String(children).toLowerCase();

  if (textLower.includes('pendiente')) {
    Icon = CircleDot;
    sealColor = 'var(--accent-warning)';
  } else if (textLower.includes('listo')) {
    Icon = Sparkles;
    sealColor = 'var(--accent-primary)';
  } else if (textLower.includes('entregado')) {
    Icon = Check;
    sealColor = 'var(--accent-success)';
  } else if (textLower.includes('cancelado') || textLower.includes('devuelto')) {
    Icon = CircleDot;
    sealColor = 'var(--accent-error)';
  }

  return (
    <span className="badge-status" style={{ color: sealColor, ...style }} {...props}>
      <Icon size={13} strokeWidth={2.5} />
      {children}
    </span>
  );
}
