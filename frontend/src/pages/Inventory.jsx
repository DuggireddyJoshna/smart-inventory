import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, deleteProduct } from '../utils/api';
import { Plus, Search, Trash2 } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '', stock: '', price: '', category: '', threshold: 10
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await createProduct({
        ...newProduct,
        stock: Number(newProduct.stock),
        price: Number(newProduct.price),
        threshold: Number(newProduct.threshold)
      });
      setShowAddForm(false);
      setNewProduct({ name: '', stock: '', price: '', category: '', threshold: 10 });
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (err) {
        console.error(err);
        alert('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Inventory Management</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input type="text" className="form-input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input type="text" className="form-input" required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input type="number" step="0.01" className="form-input" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Stock</label>
              <input type="number" className="form-input" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Alert Threshold</label>
              <input type="number" className="form-input" required value={newProduct.threshold} onChange={e => setNewProduct({...newProduct, threshold: e.target.value})} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '1.2rem' }}>
              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>Save Product</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search products by name or category..." 
            style={{ paddingLeft: '2.8rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Total Value</th>
                <th>Threshold</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                    <td><span className="badge badge-success" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{product.category}</span></td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${product.stock <= product.threshold ? 'badge-danger' : 'badge-success'}`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td>${(product.price * product.stock).toFixed(2)}</td>
                    <td>{product.threshold} units</td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDelete(product._id)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Inventory;
