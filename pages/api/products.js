
import { connectDB } from '../../lib/mongoose';
import Product from '../../src/models/Product';
import mongoose from 'mongoose';

// API route handler
export default async function handler(req, res) {
    try {
        // Log request details
        console.log('API Request:', {
            method: req.method,
            query: req.query,
            path: req.url
        });

        // Connect to MongoDB
        const conn = await connectDB();
        console.log('MongoDB Connected:', {
            readyState: mongoose.connection.readyState,
            name: mongoose.connection.name
        });

        switch (req.method) {
            case 'GET':
                const products = await Product.find().sort({ name: 1 });
                return res.status(200).json(products);

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}

        case 'POST':
            try {
                const product = new Product(req.body);
                await product.save();
                res.status(201).json(product);
            } catch (error) {
                console.error('Failed to create product:', error);
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
                console.error('Failed to update product:', error);
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
                console.error('Failed to delete product:', error);
                res.status(400).json({ error: error.message });
            }
            break;

        default:
            console.warn('Method not allowed:', req.method);
            res.status(405).json({ error: 'Method not allowed' });
    }
}
