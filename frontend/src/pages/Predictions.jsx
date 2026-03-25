import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchSales } from '../utils/api';
import { TrendingUp, AlertTriangle, CalendarClock } from 'lucide-react';

const Predictions = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prodData, salesData] = await Promise.all([
          fetchProducts(),
          fetchSales()
        ]);
        setProducts(prodData);
        setSales(salesData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading predictive data...</div>;

  // Calculate Average Daily Sales per product (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const recentSales = sales.filter(s => new Date(s.date) >= sevenDaysAgo);

  const salesByProduct = {};
  recentSales.forEach(s => {
    if (!salesByProduct[s.productId]) salesByProduct[s.productId] = 0;
    salesByProduct[s.productId] += s.quantity;
  });

  const predictions = products.map(product => {
    const totalSoldLast7Days = salesByProduct[product._id] || 0;
    const avgDailySales = totalSoldLast7Days / 7;
    
    // Days until stock runs out
    const daysLeft = avgDailySales > 0 ? Math.floor(product.stock / avgDailySales) : Infinity;
    
    let restockDate = null;
    if (daysLeft !== Infinity) {
      restockDate = new Date();
      restockDate.setDate(restockDate.getDate() + daysLeft);
    }
    
    // Suggest ordering enough for 30 days of stock
    const suggestedQuantity = avgDailySales > 0 ? Math.ceil((avgDailySales * 30) - product.stock) : 0;

    return {
      ...product,
      avgDailySales: avgDailySales.toFixed(2),
      daysLeft,
      restockDate,
      suggestedQuantity: suggestedQuantity > 0 ? suggestedQuantity : 0
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  const criticalRestock = predictions.filter(p => p.daysLeft <= 7 && p.daysLeft !== Infinity);

  return (
    <div>
      <h1 className="page-title">Inventory Predictions</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Based on your sales velocity over the last 7 days, here is when you'll run out of stock and what you need to order.
      </p>

      {criticalRestock.length > 0 && (
        <div style={{ backgroundColor: 'rgba(210, 153, 34, 0.1)', borderLeft: '4px solid var(--warning)', padding: '1.5rem', borderRadius: '0 8px 8px 0', marginBottom: '2rem' }}>
          <h3 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <AlertTriangle size={20} /> Critical Restock Required
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {criticalRestock.map(prod => (
              <div key={`crit-${prod._id}`} className="card" style={{ backgroundColor: 'var(--bg-color)' }}>
                <h4 style={{ marginBottom: '0.5rem' }}>{prod.name}</h4>
                <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Runs out in: {prod.daysLeft} days</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Suggested Order: {prod.suggestedQuantity} units</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <TrendingUp size={20} /> All Product Forecasts
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Current Stock</th>
                <th>Avg Daily Sales (Last 7d)</th>
                <th>Estimated Days Left</th>
                <th>Restock By</th>
                <th>Suggested Order Qty (30d Supply)</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map(prod => (
                <tr key={prod._id}>
                  <td style={{ fontWeight: 500 }}>{prod.name}</td>
                  <td>{prod.stock}</td>
                  <td>{prod.avgDailySales} units/day</td>
                  <td>
                    {prod.daysLeft === Infinity ? (
                      <span className="badge badge-success">No recent sales</span>
                    ) : (
                      <span className={`badge ${prod.daysLeft <= 7 ? 'badge-danger' : prod.daysLeft <= 14 ? 'badge-warning' : 'badge-success'}`}>
                        {prod.daysLeft} days
                      </span>
                    )}
                  </td>
                  <td>
                    {prod.restockDate ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: prod.daysLeft <= 7 ? 'var(--danger)' : 'inherit' }}>
                        <CalendarClock size={16} /> 
                        {prod.restockDate.toLocaleDateString()}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td style={{ fontWeight: 'bold' }}>{prod.suggestedQuantity > 0 ? `+${prod.suggestedQuantity} units` : '0 units'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Predictions;
