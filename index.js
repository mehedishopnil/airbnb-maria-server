const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

// Environment Variables Check
if (!process.env.DB_USER || !process.env.DB_PASS) {
  throw new Error('Missing DB credentials');
}

// MongoDB Connection Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q6abx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// GLOBAL Caching for Vercel Serverless
let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  const db = client.db("airbnbDB");

  cachedClient = client;
  cachedDb = db;

  console.log("MongoDB connected successfully!");
  return { client, db };
}

// Health Route
app.get('/', (req, res) => {
  res.send('Airbnb Server is running.');
});

// Fetch hotel data
app.get('/hotel-data', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('hotelData').find().toArray();
    res.json(result);
  } catch (error) {
    console.error('GET /hotel-data error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch users data
app.get('/users', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('users').find().toArray();
    res.json(result);
  } catch (error) {
    console.error('GET /users error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch hotel list
app.get('/hotels-list', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('hotelList').find().toArray();
    res.json(result);
  } catch (error) {
    console.error('GET /hotels-list error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Insert hotel into list
app.post('/hotels-list', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('hotelList').insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error('POST /hotels-list error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch earnings
app.get('/earnings', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('earningList').find().toArray();
    res.json(result);
  } catch (error) {
    console.error('GET /earnings error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Insert earning
app.post('/earnings', async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db.collection('earningList').insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error('POST /earnings error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export app (VERY IMPORTANT for Vercel)
module.exports = app;
