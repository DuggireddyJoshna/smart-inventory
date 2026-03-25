const API_BASE_URL = "https://smart-inventory-8ay3.onrender.com/api";

// -------------------- PRODUCTS --------------------

// Get all products
export const fetchProducts = async () => {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
};

// Create product
export const createProduct = async (productData) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create product: ${errorText}`);
  }

  return res.json();
};

// Update product
export const updateProduct = async (id, productData) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(productData)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update product: ${errorText}`);
  }

  return res.json();
};

// Delete product
export const deleteProduct = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE'
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete product: ${errorText}`);
  }

  return res.json();
};

// -------------------- SALES --------------------

// Get all sales
export const fetchSales = async () => {
  const res = await fetch(`${API_BASE_URL}/sales`);
  if (!res.ok) throw new Error(`Failed to fetch sales: ${res.status}`);
  return res.json();
};

// Record sale
export const recordSale = async (saleData) => {
  const res = await fetch(`${API_BASE_URL}/sales`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(saleData)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to record sale: ${errorText}`);
  }

  return res.json();
};