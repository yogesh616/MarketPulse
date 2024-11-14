require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 3000;
const router = require('./Routes/routes.js');
const server = http.createServer(app);

app.use(express.json());
app.use('/api', router);
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let stockData = {
  "AAPL": { basePrice: 150.00 },
  "GOOGL": { basePrice: 2800.00 },
  "AMZN": { basePrice: 3400.00 },
  "SONY": { basePrice: 1400.00 },
  "TSLA": { basePrice: 350.00 },
  "MSFT": { basePrice: 418.00 },
  "META": { basePrice: 586.00 },
  "NFLX": { basePrice: 805.44 },
  "BABA": { basePrice: 95.42 },
  "UBER": { basePrice: 71.67 }
};

const alertData = {};  // Store alerts with { ticker: { clientId: alertPrice } }
const connectedClients = [];  // Store all connected clients

const randomChange = () => (Math.random() - 0.5) * 2;
const randomVolume = (min, max) => Math.floor(Math.random() * (max - min) + min);

const generateStockData = (ticker) => {
  const stock = stockData[ticker];
  stock.basePrice += randomChange();
  const open = stock.basePrice + randomChange();
  const high = open + randomChange() * 2;
  const low = open - Math.abs(randomChange() * 2);
  const close = open + randomChange();

  return {
    ticker,
    current_price: stock.basePrice.toFixed(2),
    open: open.toFixed(2),
    high: Math.max(open, high).toFixed(2),
    low: Math.min(open, low).toFixed(2),
    close: close.toFixed(2),
    previous_close: (stock.basePrice - randomChange()).toFixed(2),
    volume: randomVolume(1000000, 5000000),
  };
};

// Global interval to generate and send stock data
setInterval(() => {
  const stockUpdates = {};
  Object.keys(stockData).forEach(ticker => {
    stockUpdates[ticker] = generateStockData(ticker);
  });

  // Send updates to all connected clients
  for (const client of connectedClients) {
    const ticker = client.ticker;
    if (stockUpdates[ticker]) {
      client.res.write(`data: ${JSON.stringify(stockUpdates[ticker])}\n\n`);
      
      // Check alerts for this client
      const currentPrice = parseFloat(stockUpdates[ticker].current_price);
      if (alertData[ticker] && alertData[ticker][client.clientId]) {
        const alertPrice = alertData[ticker][client.clientId];
        if (currentPrice >= alertPrice) {
          client.res.write(`data: ${JSON.stringify({
            message: `Alert for ${ticker}: Price reached ${alertPrice}`,
            stock: stockUpdates[ticker]
          })}\n\n`);
          delete alertData[ticker][client.clientId];
        }
      }
    }
  }
}, 1000);

// Route for stock data with SSE
app.get('/api/stockData/:ticker', (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  if (!stockData[ticker]) {
    return res.status(404).json({ error: 'Ticker not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const clientId = req.connection.remoteAddress;
  connectedClients.push({ res, ticker, clientId });

  req.on('close', () => {
    const index = connectedClients.findIndex(client => client.res === res);
    if (index !== -1) connectedClients.splice(index, 1);
    if (alertData[ticker]) {
      delete alertData[ticker][clientId];
    }
  });
});

// Route to set price alerts
app.post('/api/setAlert', (req, res) => {
  const { ticker, alertPrice } = req.body;
  const clientId = req.connection.remoteAddress;
  
  if (!stockData[ticker]) {
    return res.status(404).json({ error: 'Ticker not found' });
  }

  if (!alertData[ticker]) {
    alertData[ticker] = {};
  }
  
  alertData[ticker][clientId] = parseFloat(alertPrice);
  res.json({ message: `Alert set for ${ticker} at price ${alertPrice}` });
});

// Route to get available tickers
app.get('/api/tickers', (req, res) => {
  res.json(Object.keys(stockData));
});

server.listen(port, () => console.log('Listening on port ' + port));
