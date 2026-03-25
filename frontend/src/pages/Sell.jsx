import React, { useState, useEffect } from 'react';
import { fetchProducts, recordSale } from '../utils/api';
import { ShoppingCart, Plus, Trash2, CheckCircle } from 'lucide-react';

const Sell = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleAddToCart = () => {
    setError('');
    setSuccessMsg('');
    
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }

    const product = products.find(p => p._id === selectedProductId);
    const qty = parseInt(quantity);

    if (qty <= 0) {
      setError('Quantity must be at least 1');
      return;
    }

    // Check existing cart item quantity to ensure total doesn't exceed stock
    const existingCartItem = cart.find(item => item._id === selectedProductId);
    const totalRequestedQty = existingCartItem ? existingCartItem.cartQty + qty : qty;

    if (totalRequestedQty > product.stock) {
      setError(`Insufficient stock. Only ${product.stock} units available.`);
      return;
    }

    if (existingCartItem) {
      setCart(cart.map(item => 
        item._id === selectedProductId 
          ? { ...item, cartQty: item.cartQty + qty, totalPrice: (item.cartQty + qty) * item.price }
          : item
      ));
    } else {
      setCart([...cart, { 
        ...product, 
        cartQty: qty, 
        totalPrice: product.price * qty 
      }]);
    }

    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const handleCheckout = async () => {
    setError('');
    try {
      for (const item of cart) {
        await recordSale({
          productId: item._id,
          quantity: item.cartQty
        });
      }
      setSuccessMsg('Sale completed successfully!');
      setCart([]);
      loadProducts(); // Refresh stock
    } catch (err) {
      console.error(err);
      setError('Failed to process checkout. Some items may have insufficient stock.');
    }
  };

  const selectedProductDetails = products.find(p => p._id === selectedProductId);
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div>
      <h1 className="page-title">Point of Sale</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 400px)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Selection Area */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} color="var(--accent-primary)" /> Select Product
          </h3>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(248, 81, 73, 0.1)', color: 'var(--danger)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(248, 81, 73, 0.3)' }}>
              {error}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: 'rgba(46, 160, 67, 0.1)', color: 'var(--success)', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(46, 160, 67, 0.3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} /> {successMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Product</label>
            <select 
              className="form-input" 
              value={selectedProductId} 
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={loading}
            >
              <option value="">-- Choose a product --</option>
              {products.map(p => (
                <option key={p._id} value={p._id} disabled={p.stock === 0}>
                  {p.name} (${p.price.toFixed(2)}) - {p.stock} in stock
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input 
              type="number" 
              min="1" 
              className="form-input" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!selectedProductId}
            />
          </div>

          {selectedProductDetails && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Unit Price:</span>
                <span>${selectedProductDetails.price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Line Total:</span>
                <span style={{ color: 'var(--accent-primary)' }}>${(selectedProductDetails.price * quantity || 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem' }}
            onClick={handleAddToCart}
          >
            Add to Bill
          </button>
        </div>

        {/* Invoice Area */}
        <div className="card" style={{ backgroundColor: '#161b22', border: '1px solid var(--border-color)', position: 'sticky', top: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShoppingCart size={20} /> Current Bill</span>
            {cart.length > 0 && <span className="badge badge-success">{cart.length} items</span>}
          </h3>

          <div style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto', marginBottom: '1rem' }}>
            {cart.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                Bill is empty
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem', 
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {item.cartQty} x ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontWeight: 'bold' }}>${item.totalPrice.toFixed(2)}</div>
                    <button className="btn btn-danger" style={{ padding: '0.3rem' }} onClick={() => handleRemoveFromCart(item._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '1.5rem', marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              <span>Total Amount:</span>
              <span style={{ color: 'var(--success)', fontSize: '1.5rem' }}>${cartTotal.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-success" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              Complete Sale
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Sell;
