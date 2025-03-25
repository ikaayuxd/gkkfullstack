import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectDB() {
  try {
    // Check if we already have a connection
    if (mongoose.connections[0].readyState) {
      console.log('Using existing MongoDB connection');
      return mongoose.connection;
    }

    // Basic connection options
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, opts);
    
    const db = mongoose.connection;
    console.log('MongoDB connected successfully to:', db.name);
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    throw error;
  }
}

// Connection event handlers
mongoose.connection.on('connected', () => console.log('MongoDB event: Connected'));
mongoose.connection.on('error', err => console.error('MongoDB event: Error:', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB event: Disconnected'));
