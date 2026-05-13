import React from 'react';
import Analytics from '../features/analytics/Analytics';

export default function Analisis({ orders, returns }) {
  return (
    <div className="page-fade">
      <Analytics orders={orders} returns={returns} />
    </div>
  );
}
