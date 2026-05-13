import React from 'react';
import OrderList from '../features/orders/OrderList';

export default function Historial({ orders, onOrderClick, loading }) {
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  return (
    <div className="page-fade">
      <OrderList 
        orders={deliveredOrders} 
        onOrderClick={onOrderClick} 
        title="Historial" 
        loading={loading} 
      />
    </div>
  );
}
