import React from 'react';
import OrderForm from '../features/orders/OrderForm';

export default function Crear({ onOrderCreated }) {
  return (
    <div className="page-fade">
      <OrderForm onOrderCreated={onOrderCreated} />
    </div>
  );
}
