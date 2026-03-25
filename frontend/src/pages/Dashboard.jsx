import React, { useEffect, useState } from 'react';
import { fetchSales } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSales();
        setSales(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading dashboard data...</div>;

  // Calculate Today's Sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySales = sales.filter(s => new Date(s.date) >= today);
  const itemsSoldToday = todaySales.reduce((sum, s) => sum + s.quantity, 0);
  const revenueToday = todaySales.reduce((sum, s) => sum + s.totalPrice, 0);

  // Calculate Last 7 Days Sales
  const days = [];
  const dailyRevenue = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    
    const startOfDay = new Date(d);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(d);
    endOfDay.setHours(23,59,59,999);
    
    const daySales = sales.filter(s => {
      const sDate = new Date(s.date);
      return sDate >= startOfDay && sDate <= endOfDay;
    });
    
    dailyRevenue.push(daySales.reduce((sum, s) => sum + s.totalPrice, 0));
  }

  // Top Selling Products
  const productSalesMap = {};
  sales.forEach(s => {
    if (!productSalesMap[s.productName]) {
      productSalesMap[s.productName] = 0;
    }
    productSalesMap[s.productName] += s.quantity;
  });
  
  const topProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const chartData = {
    labels: days,
    datasets: [
      {
        label: 'Daily Revenue ($)',
        data: dailyRevenue,
        borderColor: '#58a6ff',
        backgroundColor: 'rgba(88, 166, 255, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8b949e' }
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#8b949e' }
      }
    }
  };

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Today's Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
            ${revenueToday.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Items Sold Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {itemsSoldToday} items
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Lifetime Sales</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            ${sales.reduce((sum, s) => sum + s.totalPrice, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card">
          <h3>Revenue (Last 7 Days)</h3>
          <div style={{ height: '300px', marginTop: '1rem' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="card">
          <h3>Top Selling Products</h3>
          <div style={{ marginTop: '1rem' }}>
            {topProducts.map(([name, qty], index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '0.8rem 0',
                borderBottom: index < topProducts.length - 1 ? '1px solid var(--border-color)' : 'none'
              }}>
                <span style={{ fontWeight: 500 }}>{name}</span>
                <span className="badge badge-success">{qty} sold</span>
              </div>
            ))}
            {topProducts.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No sales data available.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
