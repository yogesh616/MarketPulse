const express = require('express');
const router = express.Router();
const Stocks = require('../DB/db.js');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 600 seconds (10 minutes)

// GET all stocks
router.get('/all', async (req, res) => {
  const cacheKey = 'allStocks';
  const cachedStocks = cache.get(cacheKey);

  if (cachedStocks) {
   // console.log('Serving from cache');
    return res.json(cachedStocks);
  }

  try {
    const stocks = await Stocks.find({}).lean();
    cache.set(cacheKey, stocks); // Cache the response data
    res.json(stocks);
  } catch (err) {
   // console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET single stock based on Symbol
router.get('/single', async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) return res.status(404).json({ message: 'Please select a symbol' });

  const cacheKey = `stock_${symbol}`;
  const cachedStock = cache.get(cacheKey);

  if (cachedStock) {
   // console.log(`Serving ${symbol} from cache`);
    return res.json(cachedStock);
  }

  try {
    const stock = await Stocks.findOne({ symbol: symbol }).lean();
    if (!stock) return res.status(404).json({ message: 'Symbol not found' });

    cache.set(cacheKey, stock); // Cache the response data
    res.json(stock);
  } catch (err) {
   // console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
