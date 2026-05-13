import React from 'react';
import Dashboard from '../features/dashboard/Dashboard';
import OrderList from '../features/orders/OrderList';

export default function Resumen({ orders, returns, onOrderClick, loading }) {
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED').slice(0, 5);

  return (
    <div className="page-fade">
      <Dashboard orders={orders} returns={returns} />
      <div style={{ marginTop: '32px' }}>
        <h3 className="section-title">Pedidos Recientes</h3>
        <OrderList 
          orders={activeOrders} 
          onOrderClick={onOrderClick} 
          title="" 
          loading={loading} 
        />
      </div>
    </div>
  );
}
