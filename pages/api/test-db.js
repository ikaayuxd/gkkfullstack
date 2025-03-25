import { connectDB } from '../../lib/mongoose';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    try {
        // 1. Log connection attempt
        console.log('Attempting database connection...');
        
        // 2. Connect to database
        const conn = await connectDB();
        
        // 3. Get connection status
        const status = {
            isConnected: mongoose.connection.readyState === 1,
            database: mongoose.connection.name,
            host: mongoose.connection.host
        };

        // 4. Return success
        return res.status(200).json({
            success: true,
            message: 'Database connected successfully',
            status: status
        });

    } catch (error) {
        // Log and return error
        console.error('Connection failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            type: error.name,
            code: error.code
        });
    }
}
