import { connectToDatabase } from '../../lib/mongodb';
import Product from '../../src/models/Product';
import mongoose from 'mongoose';

//export default async function handler(req, res) {
//  if (!mongoose.connections[0].readyState) {
  //  await mongoose.connect(process.env.MONGODB_URI);
//  }

  //hjh
    export default async function handler(req, res) {
    console.log(`Received ${req.method} request for /api/products with query:`, req.query);

    // Check if MongoDB is connected
    if (!mongoose.connections[0].readyState) {
        console.log('Attempting to connect to MongoDB...');
        try {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('MongoDB connected successfully');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            return res.status(500).json({ error: 'Database connection failed' });
        }
    }

    switch (req.method) {
        case 'GET':
            try {
                const { category } = req.query;
                const query = category ? { category } : {};
                console.log('Fetching products with query:', query);
                const products = await Product.find(query).sort({ name: 1 });
                console.log('Fetched products:', products);
                res.status(200).json(products);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                res.status(500).json({ error: 'Failed to fetch products' });
            }
            break;

        // Handle other methods (POST, PUT, DELETE) similarly...

        default:
            console.warn('Method not allowed:', req.method);
            res.status(405).json({ error: 'Method not allowed' });
    }
    }

    case 'POST':
      try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const product = await Product.findByIdAndUpdate(
          id,
          { ...req.body, updatedAt: Date.now() },
          { new: true, runValidators: true }
        );
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
