import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://xaayux:909090xd@cluster0.mojpz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const MONGODB_DB = "gumasta_krishi_kendra";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env');
}

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = await client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
