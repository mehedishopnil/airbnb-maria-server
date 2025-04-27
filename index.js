const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment Variables Safe Check
if (!process.env.DB_USER || !process.env.DB_PASS) {
  throw new Error('Missing DB credentials in environment variables');
}

// MongoDB Setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q6abx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Health Check Route
app.get('/', (req, res) => {
  res.send('Airbnb Server is running');
});

// MongoDB and Routes Setup
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("airbnbDB");

    const DataOfHotelCollection = db.collection("hotelData");
    const usersDataCollection = db.collection("users");
    const AllHotelListCollection = db.collection("hotelList");
    const earningListCollection = db.collection("earningList");

    // Define routes
    app.get('/hotel-data', async (req, res) => {
      try {
        const result = await DataOfHotelCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error('GET /hotel-data - Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/users', async (req, res) => {
      try {
        const result = await usersDataCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error('GET /users - Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/hotels-list', async (req, res) => {
      try {
        const result = await AllHotelListCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error('GET /hotels-list - Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/hotels-list', async (req, res) => {
      try {
        const newItem = req.body;
        const result = await AllHotelListCollection.insertOne(newItem);
        res.json(result);
      } catch (error) {
        console.error('POST /hotels-list - Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.get('/earnings', async (req, res) => {
      try {
        const result = await earningListCollection.find().toArray();
        res.json(result);
      } catch (error) {
        console.error('GET /earnings - Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    app.post('/earnings', async (req, res) => {
      try {
        const newItem = req.body;
        const result = await earningListCollection.insertOne(newItem);
        res.json(result);
      } catch (error) {
        console.error('POST /earnings - Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Ping DB
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB Successfully!");

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Initialize MongoDB Connection
connectDB();

// IMPORTANT: Export the Express app (No app.listen())
module.exports = app;
