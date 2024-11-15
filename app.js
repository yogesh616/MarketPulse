const puppeteer = require('puppeteer');
const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const app = express();

mongoose.connect('mongodb+srv://user:password@cluster0.ihj3a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connection established'))
  .catch(() => console.log('MongoDB connection aborted'));

// Define the schema
const stockSchema = new mongoose.Schema({
  symbol: String, // Add a field for stock symbol
  data: Schema.Types.Mixed // Store stock data flexibly as Mixed type
});

// Create a model for the schema
const Stock = mongoose.model('Stock', stockSchema);

const quote = 'UBER';
const url = `https://finance.yahoo.com/quote/${quote}/history/`;

async function fetchStockData() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const stockData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.table tbody tr'));
      return rows.map(row => {
        const columns = row.querySelectorAll('td');
        if (columns.length < 7) return null; // Ignore rows without full data

        const date = columns[0].innerText.trim();
        const open = parseFloat(columns[1].innerText.replace(',', ''));
        const high = parseFloat(columns[2].innerText.replace(',', ''));
        const low = parseFloat(columns[3].innerText.replace(',', ''));
        const close = parseFloat(columns[4].innerText.replace(',', ''));
        const adjClose = parseFloat(columns[5].innerText.replace(',', ''));
        const volume = parseInt(columns[6].innerText.replace(/,/g, ''));

        return { date, open, high, low, close, adjClose, volume };
      }).filter(Boolean); // Filter out any null values
    });

    await browser.close();

    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return [];
  }
}

// Save stock data to MongoDB
app.get('/save', async (req, res) => {
  const data = await fetchStockData();
  if (data.length > 0) {
    const stock = new Stock({ symbol: quote, data: data });
    await stock.save();
    console.log('Stock data saved to MongoDB');
    res.json({ message: 'Stock data saved successfully' });
  } else {
    res.json({ message: 'No data to save' });
  }
});

// Fetch and display stock data without saving
app.get('/data', async (req, res) => {
  const data = await fetchStockData();
  res.json(data);
});

// Retrieve saved stock data for a specific symbol
app.get('/get', async (req, res) => {
  const stock = await Stock.findOne({ symbol: quote }).lean();
  if (!stock) {
    return res.status(404).json({ error: "Ticker not found" });
  }
  res.json(stock.price); // Directly return stock.price without parsing
});

// Retrieve all saved stock data
app.get('/all', async (req, res) => {
  const stocks = await Stock.find().lean();
  res.json(stocks);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
