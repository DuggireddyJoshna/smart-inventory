import React, { useState, useEffect } from 'react';
import { fetchProducts, fetchSales } from '../utils/api';
import { AlertCircle, AlertTriangle, PackageX } from 'lucide-react';

const Alerts = () => {
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

  if (loading) return <div style={{ padding: '2rem' }}>Loading alerts...</div>;

  // 1. Low Stock Alerts (stock <= threshold)
  const lowStockProducts = products.filter(p => p.stock <= p.threshold);

  // 2. Overstock Alerts (stock too high compared to demand)
  // Logic: avg daily sales over 30 days is very low, but stock > 50 AND stock > (avg * 90 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSales = sales.filter(s => new Date(s.date) >= thirtyDaysAgo);
  const salesByProduct = {};
  recentSales.forEach(s => {
    if (!salesByProduct[s.productId]) salesByProduct[s.productId] = 0;
    salesByProduct[s.productId] += s.quantity;
  });

  const overstockedProducts = products.filter(product => {
    const totalSoldLast30Days = salesByProduct[product._id] || 0;
    const avgDailySales = totalSoldLast30Days / 30;
    
    // Overstock condition: More than 50 units in stock AND would take > 90 days to sell
    if (product.stock > 50 && (avgDailySales === 0 || (product.stock / avgDailySales) > 90)) {
      return true;
    }
    return false;
  }).map(p => ({
    ...p,
    avgDaily: (salesByProduct[p._id] || 0) / 30
  }));

  // 3. Out of Stock
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return (
    <div>
      <h1 className="page-title">Inventory Alerts</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr)', gap: '2rem' }}>
        
        {/* Out of stock */}
        {outOfStockProducts.length > 0 && (
          <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <PackageX size={20} /> Out of Stock ({outOfStockProducts.length})
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {outOfStockProducts.map(p => (
                    <tr key={`oos-${p._id}`}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Immediate Restock Needed</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Low Stock */}
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <h3 style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} /> Low Stock Alerts ({lowStockProducts.length})
          </h3>
          {lowStockProducts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>All products have sufficient stock.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock Level</th>
                    <th>Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(p => (
                    <tr key={`low-${p._id}`}>
                      <td>{p.name}</td>
                      <td style={{ fontWeight: 'bold', color: p.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                        {p.stock} units
                      </td>
                      <td>{p.threshold} units</td>
                      <td>
                        <span className={`badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {p.stock === 0 ? 'Depleted' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Overstock */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
          <h3 style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={20} /> Overstock Alerts ({overstockedProducts.length})
          </h3>
          {overstockedProducts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No overstocked items detected.</p>
          ) : (
             <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Avg Daily Sales (30d)</th>
                    <th>Capital Tied Up</th>
                  </tr>
                </thead>
                <tbody>
                  {overstockedProducts.map(p => (
                    <tr key={`over-${p._id}`}>
                      <td>{p.name}</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{p.stock} units</td>
                      <td>{p.avgDaily.toFixed(2)} units/day</td>
                      <td>${(p.stock * p.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Alerts;
