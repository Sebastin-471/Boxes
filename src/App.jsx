import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';
import { supabase } from './lib/supabase';
import { Package, PlusCircle, History } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'new', 'history'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data);
      
      // Update selected order reference if it exists
      if (selectedOrder) {
        const updated = data.find(o => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const subscription = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const pendingOrders = orders.filter(o => o.status !== 'DELIVERED');
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isEditing && selectedOrder) {
      return (
        <OrderForm 
          initialData={selectedOrder}
          onOrderCreated={() => {
            fetchOrders();
            setIsEditing(false);
          }} 
        />
      );
    }

    if (selectedOrder) {
      return (
        <OrderDetail 
          order={selectedOrder} 
          onBack={() => setSelectedOrder(null)} 
          onEdit={() => setIsEditing(true)}
          onStatusUpdate={() => {
            fetchOrders();
          }}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <OrderList 
            orders={pendingOrders} 
            title="Pedidos Activos" 
            onOrderClick={handleOrderClick} 
            loading={loading} 
          />
        );
      case 'new':
        return (
          <OrderForm onOrderCreated={() => {
            fetchOrders();
            setActiveTab('dashboard');
          }} />
        );
      case 'history':
        return (
          <OrderList 
            orders={deliveredOrders} 
            title="Historial" 
            onOrderClick={handleOrderClick} 
            loading={loading} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      {!selectedOrder && <Header />}
      
      <main style={{ flex: 1, paddingBottom: '100px' }}>
        {renderContent()}
      </main>

      {!selectedOrder && (
        <nav className="bottom-nav">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <Package size={24} />
            <span>Pedidos</span>
          </button>
          <button 
            onClick={() => setActiveTab('new')}
            className={`nav-btn ${activeTab === 'new' ? 'active' : ''}`}
          >
            <PlusCircle size={28} style={{ color: activeTab === 'new' ? '#8b5cf6' : 'var(--text-tertiary)' }} />
            <span>Crear</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            <History size={24} />
            <span>Historial</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
