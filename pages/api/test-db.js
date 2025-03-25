import { connectDB } from '../../lib/mongoose';
import Product from '../../src/models/Product';

export default async function handler(req, res) {
    try {
        // Connect to MongoDB
        await connectDB();

        // Create a test product
        const testProduct = new Product({
            name: 'Test Seeds',
            category: 'Seeds',
            price: 100,
            costPrice: 80,
            stock: 50,
            unit: 'kg',
            minStockAlert: 10
        });

        // Save the product
        await testProduct.save();

        // Fetch all products to verify
        const allProducts = await Product.find({});

        return res.status(200).json({
            success: true,
            message: 'Test product created successfully',
            testProduct: testProduct,
            allProducts: allProducts
        });

    } catch (error) {
        console.error('Test product creation error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            type: error.name
        });
    }
}
