const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Sale = require('./models/Sale');

const dummyProducts = [
  { name: 'Apple EarPods', stock: 50, price: 19.99, category: 'Electronics', threshold: 10 },
  { name: 'Samsung Charger', stock: 120, price: 14.50, category: 'Electronics', threshold: 20 },
  { name: 'Wireless Mouse', stock: 35, price: 25.00, category: 'Accessories', threshold: 15 },
  { name: 'Mechanical Keyboard', stock: 8, price: 89.99, category: 'Accessories', threshold: 10 },
  { name: 'USB-C Hub', stock: 45, price: 34.99, category: 'Accessories', threshold: 15 },
  { name: 'Laptop Stand', stock: 2, price: 45.00, category: 'Office', threshold: 5 }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Sale.deleteMany({});
    console.log('Cleared existing data');

    // Insert Products
    const createdProducts = await Product.insertMany(dummyProducts);
    console.log('Inserted dummy products');

    // Insert some sales (spread over the last 7 days)
    const dummySales = [];
    for (let i = 0; i < 30; i++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Within last 7 days
        
        dummySales.push({
            productId: product._id,
            productName: product.name,
            quantity: qty,
            totalPrice: product.price * qty,
            date: date
        });
    }

    await Sale.insertMany(dummySales);
    console.log('Inserted dummy sales history');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seedDatabase();
