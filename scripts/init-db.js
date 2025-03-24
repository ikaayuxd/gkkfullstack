const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://xaayux:909090xd@cluster0.mojpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const sampleProducts = [
  {
    name: 'Wheat Seeds Premium',
    category: 'Seeds',
    price: 120,
    costPrice: 90,
    stock: 100,
    unit: 'kg',
    minStockAlert: 20,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'NPK Fertilizer',
    category: 'Fertilizers',
    price: 850,
    costPrice: 700,
    stock: 50,
    unit: 'kg',
    minStockAlert: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Weed Control Plus',
    category: 'Herbicides',
    price: 450,
    costPrice: 350,
    stock: 30,
    unit: 'l',
    minStockAlert: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Insect Shield',
    category: 'Pesticides',
    price: 550,
    costPrice: 420,
    stock: 25,
    unit: 'l',
    minStockAlert: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function initializeDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db();

    // Clear existing collections
    await db.collection('products').deleteMany({});
    await db.collection('sales').deleteMany({});

    // Insert sample products
    const result = await db.collection('products').insertMany(sampleProducts);
    console.log(`Inserted ${result.insertedCount} sample products`);

    // Create indexes
    await db.collection('products').createIndex({ name: 1 }, { unique: true });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ stock: 1 });

    await db.collection('sales').createIndex({ invoiceNumber: 1 }, { unique: true });
    await db.collection('sales').createIndex({ customerName: 1 });
    await db.collection('sales').createIndex({ saleDate: -1 });
    await db.collection('sales').createIndex({ paymentStatus: 1 });

    console.log('Database initialized successfully');
    await client.close();
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
