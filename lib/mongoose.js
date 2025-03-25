import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://aayu:909090gg@aayu.vgpfl.mongodb.net/?retryWrites=true&w=majority&appName=aayu';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectDB() {
  try {
    // Check if we already have a connection
    if (mongoose.connections[0].readyState) {
      console.log('Using existing MongoDB connection');
      return mongoose.connection;
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully to:', conn.connection.name);
    
    return conn;
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
