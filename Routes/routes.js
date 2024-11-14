const express = require('express');
const router = express.Router();
const NodeCache = require('node-cache');
const allData = require('./data/data.js'); // Static data array

const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 600 seconds (10 minutes)

// GET all stocks
router.get('/all', async (req, res) => {
  const cacheKey = 'allStocks';
  const cachedStocks = cache.get(cacheKey);

  if (cachedStocks) {
    console.log('Serving all stocks from cache');
    return res.json(cachedStocks);
  }

  cache.set(cacheKey, allData); // Cache the allData response
  res.json(allData);
});

// GET single stock based on Symbol
router.get('/single', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ message: 'Please provide a stock symbol.' });

  const cacheKey = `stock_${symbol}`;
  const cachedStock = cache.get(cacheKey);

  if (cachedStock) {
    console.log(`Serving ${symbol} from cache`);
    return res.json(cachedStock);
  }

  try {
    const stock = allData.find((stock) => stock.symbol === symbol.toUpperCase());
    if (!stock) return res.status(404).json({ message: 'Symbol not found' });

    cache.set(cacheKey, stock); // Cache the response data
    res.json(stock);
  } catch (err) {
    console.error('Error fetching stock:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
