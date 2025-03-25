import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    if (mongoose.connections[0].readyState) {
      console.log('Using existing MongoDB connection');
      return mongoose.connection;
    }

    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoCreate: true // Allow database and collections to be created automatically
    };

    // Log connection attempt (hiding sensitive info)
    const sanitizedUri = process.env.MONGODB_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@');
    console.log('Connecting to MongoDB with URI:', sanitizedUri);

    await mongoose.connect(process.env.MONGODB_URI, opts);
    console.log('MongoDB connected successfully!');
    
    // Log connection details
    const db = mongoose.connection;
    console.log('Connected to database:', db.name);
    console.log('Connection state:', db.readyState);
    
  } catch (error) {
    console.error('MongoDB connection error:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
}

// Handle connection events
mongoose.connection.on('connected', () => console.log('MongoDB event: Connected'));
mongoose.connection.on('error', err => console.error('MongoDB event: Error', err));
mongoose.connection.on('disconnected', () => console.log('MongoDB event: Disconnected'));
