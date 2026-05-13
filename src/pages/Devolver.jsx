import React from 'react';
import ReturnForm from '../features/returns/ReturnForm';

export default function Devolver({ onReturnCreated }) {
  return (
    <div className="page-fade">
      <ReturnForm onReturnCreated={onReturnCreated} />
    </div>
  );
}
