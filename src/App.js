import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaSearch, FaMoon, FaSun, FaBars, FaBox } from 'react-icons/fa';
import './App.css';

const BASE_URL = "https://auto-order-backend.onrender.com";

function App() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);

  const fileToNameMap = {
    'email1.json': 'Blue Willow Catering',
    'email2.json': 'Fresh Farm Produce',
    'email3.json': 'Urban Market Orders',
    'email4.json': 'Daily Deli',
    'email5.json': 'Nature’s Basket',
    'email6.json': 'Crisp Veggies Co.',
    'email7.json': 'Golden Grocery',
    'email8.json': 'Whole Cart Wholesale',
    'email9.json': 'QuickPick Retail',
    'email10.json': 'Harvest Foods',
    'email11.json': 'Bistro Central',
    'email12.json': 'Green Basket',
    'email13.json': 'Village Organics',
    'email14.json': 'Sunset Suppliers',
    'email15.json': 'Daily Chef Orders',
    'email16.json': 'The Market Place',
    'email17.json': 'Prime Pantry',
    'email18.json': 'GreenLeaf Essentials',
    'order1.json.json': 'Custom Order Batch 1',
    'pdf1.json': 'Gourmet PDF Orders'
  };

  useEffect(() => {
    fetch(`${BASE_URL}/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => {
        console.error('Fetch error:', err);
      });
  }, []);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const exportToJSON = () => {
    if (!selectedOrder) return;
    const blob = new Blob([JSON.stringify(selectedOrder.items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedOrder.file}.json`;
    link.click();
  };

  const exportToCSV = () => {
    if (!selectedOrder) return;
    const header = "Product, Quantity\n";
    const rows = selectedOrder.items.map(i => `${i.product},${i.quantity}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedOrder.file}.csv`;
    link.click();
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a29bfe', '#00cec9'];

  const filteredOrders = orders.filter(order =>
    fileToNameMap[order.file]?.toLowerCase().includes(search.toLowerCase()) ||
    order.file.toLowerCase().includes(search.toLowerCase())
  );

  const pieData = selectedOrder
    ? selectedOrder.items.reduce((acc, item) => {
        const found = acc.find(i => i.product === item.product);
        if (found) found.quantity += item.quantity;
        else acc.push({ product: item.product, quantity: item.quantity });
        return acc;
      }, [])
    : [];

  return (
    <div className={`app ${darkMode ? 'dark' : ''} gradient-bg`}>
      <div className="header">
        <div>
          <button className="toggle" onClick={toggleSidebar}><FaBars /></button>
          <span className="pastel">Auto-Order Dashboard</span>
        </div>
        <button className="toggle" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {showSidebar && (
        <div className="sidebar">
          <h3>📦 Order Summary</h3>
          <p>Total Files: {orders.length}</p>
          <p>Total Items: {selectedOrder ? selectedOrder.items.length : 0}</p>
        </div>
      )}

      <div className="controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search file..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="export-buttons">
          <button className="export-btn" onClick={exportToCSV}>Export CSV</button>
          <button className="export-btn" onClick={exportToJSON}>Export JSON</button>
        </div>
      </div>

      <div className="card-grid">
        {filteredOrders.map((order, idx) => (
          <div
            key={idx}
            className={`order-card ${selectedOrder?.file === order.file ? 'active' : ''}`}
            onClick={() => setSelectedOrder(order)}
            style={{ backgroundColor: '#ffffff' }}
          >
            <h4>{fileToNameMap[order.file] || order.file}</h4>
            <ul>
              {Array.isArray(order.items) && order.items.slice(0, 3).map((item, index) => (
                <li key={index}><FaBox style={{ marginRight: '6px' }} /> {highlightText(item.product, search)}</li>
              ))}
            </ul>
            <p>{order.items.length} item(s)</p>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <>
          <div className="card-grid">
            {selectedOrder.items.map((item, i) => (
              <div key={i} className="order-card fade-in">
                <h4>{item.product}</h4>
                <p>Quantity: {item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="chart-area">
            <h3>📊 Total Product Quantities</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="quantity"
                  nameKey="product"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );

  function highlightText(text, keyword) {
    if (!keyword) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase()
        ? <mark key={i} style={{ backgroundColor: '#facc15' }}>{part}</mark>
        : part
    );
  }
}

export default App;
