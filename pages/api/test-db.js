import { connectDB } from '../../lib/mongoose';
import Product from '../../src/models/Product';

export default async function handler(req, res) {
    console.log('[TEST] Starting database connection test');
    
    try {
        // 1. Log environment
        console.log('[TEST] Environment variables:', {
            hasMongoURI: !!process.env.MONGODB_URI,
            mongoURILength: process.env.MONGODB_URI?.length,
            nodeEnv: process.env.NODE_ENV
        });

        // 2. Attempt connection
        console.log('[TEST] Attempting database connection...');
        await connectDB();
        console.log('[TEST] Database connected successfully');

        // 3. Create a test product
        const testProduct = new Product({
            name: 'Test Product',
            category: 'Seeds',
            price: 100,
            costPrice: 80,
            stock: 10,
            unit: 'kg',
            minStockAlert: 5
        });

        // 4. Save the test product
        console.log('[TEST] Attempting to save test product...');
        await testProduct.save();
        console.log('[TEST] Test product saved successfully');

        // 5. Return success response
        return res.status(200).json({
            success: true,
            message: 'Database connection and model test successful',
            product: testProduct
        });

    } catch (error) {
        // Log detailed error
        console.error('[TEST] Error details:', {
            message: error.message,
            name: error.name,
            code: error.code,
            stack: error.stack
        });

        // Return error response
        return res.status(500).json({
            success: false,
            error: error.message,
            type: error.name,
            code: error.code
        });
    }
}
