import { connectDB } from '../../lib/mongoose';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    try {
        // 1. Log environment check
        console.log('Environment check:', {
            hasMongoURI: !!process.env.MONGODB_URI,
            mongoURILength: process.env.MONGODB_URI?.length,
            nodeEnv: process.env.NODE_ENV
        });

        // 2. Attempt connection
        console.log('Attempting database connection...');
        const conn = await connectDB();
        
        // 3. Get connection status
        const status = {
            isConnected: !!mongoose.connection.readyState,
            readyState: mongoose.connection.readyState,
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            models: Object.keys(mongoose.models)
        };

        // 4. Return success with details
        return res.status(200).json({
            success: true,
            message: 'Database connection test',
            status: status
        });

    } catch (error) {
        // Log detailed error
        console.error('Connection test error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Return error details
        return res.status(500).json({
            success: false,
            error: error.message,
            type: error.name,
            code: error.code
        });
    }
}
