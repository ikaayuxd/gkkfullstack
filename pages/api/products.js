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
                try {
                    const { category } = req.query;
                    const query = category ? { category } : {};
                    const products = await Product.find(query).sort({ name: 1 });
                    return res.status(200).json(products);
                } catch (error) {
                    console.error('Failed to fetch products:', error);
                    return res.status(500).json({ error: 'Failed to fetch products' });
                }

            case 'POST':
                try {
                    const product = new Product(req.body);
                    await product.save();
                    return res.status(201).json(product);
                } catch (error) {
                    console.error('Failed to create product:', error);
                    return res.status(400).json({ error: error.message });
                }

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
                    return res.status(200).json(product);
                } catch (error) {
                    console.error('Failed to update product:', error);
                    return res.status(400).json({ error: error.message });
                }

            case 'DELETE':
                try {
                    const { id } = req.query;
                    const product = await Product.findByIdAndDelete(id);
                    if (!product) {
                        return res.status(404).json({ error: 'Product not found' });
                    }
                    return res.status(200).json({ message: 'Product deleted successfully' });
                } catch (error) {
                    console.error('Failed to delete product:', error);
                    return res.status(400).json({ error: error.message });
                }

            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
