import React from 'react';
import OrderList from '../features/orders/OrderList';

export default function Pedidos({ orders, onOrderClick, loading }) {
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED');

  return (
    <div className="page-fade">
      <OrderList 
        orders={activeOrders} 
        onOrderClick={onOrderClick} 
        title="Pedidos Activos" 
        loading={loading} 
      />
    </div>
  );
}
