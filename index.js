require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');
const { start } = require('repl');
const server = http.createServer(app);
const port = 3000;
const axios = require('axios');
const router = require('./Routes/routes.js');

app.use(express.json());
app.use('/api', router)

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let stockData = {
  "AAPL": {
    basePrice: 150.00
  },
  "GOOGL": {
    basePrice: 2800.00
  },
  "AMZN": {
    basePrice: 3400.00
  },
  "SONY": {
    basePrice: 1400.00
  },
  "TSLA": {
    basePrice: 350.00
  },
  "MSFT": {
    basePrice: 418.00
  },
  "META": {
    basePrice: 586.00
  },
  "NFLX": {
    basePrice: 805.44
  },
  "BABA": {
    basePrice: 95.42
  },
  "UBER": {
    basePrice: 71.67
  }

  
};

const alertData = {};  // Store alerts with { ticker: { socketId: alertPrice } }

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

io.on('connection', (socket) => {
  socket.on('getStockData', (ticker) => {
    if (!stockData[ticker]) {
      socket.emit('error', 'Ticker not found');
      return;
    }

    if (socket.stockInterval) {
      clearInterval(socket.stockInterval);
    }

    socket.stockInterval = setInterval(() => {
      const stock = generateStockData(ticker);
      socket.emit('stock', stock);

      // Check if an alert should be sent for this stock
      if (alertData[ticker]) {
        const alertClients = alertData[ticker];
        const currentPrice = parseFloat(stock.current_price);
        for (const [clientId, alertPrice] of Object.entries(alertClients)) {
          if (currentPrice >= alertPrice) {
            io.to(clientId).emit('alert', {
              message: `Alert for ${ticker}: Current price ${currentPrice} has reached or exceeded alert price ${alertPrice}`,
              stock,
            });
            delete alertClients[clientId];
          }
        }
      }
    }, 1000);
  });

  socket.on('setAlert', ({ ticker, alertPrice }) => {
    if (!stockData[ticker]) {
      socket.emit('error', 'Ticker not found');
      return;
    }
    if (!alertData[ticker]) {
      alertData[ticker] = {};
    }
    alertData[ticker][socket.id] = parseFloat(alertPrice);
    socket.emit('alertSet', `Alert set for ${ticker} at price ${alertPrice}`);
  });

  socket.on('disconnect', () => {
    if (socket.stockInterval) {
      clearInterval(socket.stockInterval);
    }
    // Remove alerts for disconnected client
    for (const ticker in alertData) {
      delete alertData[ticker][socket.id];
    }
  });
});
// Tickers 
app.get('/api/tickers', (req, res) => {
  res.json(stockData);
}) 




// Historial data 
/* const historicalData = {
  "AAPL": [
    { date: "2024-10-01", open: 149.20, high: 151.00, low: 148.50, close: 150.00, volume: 4500000 },
    { date: "2024-10-02", open: 150.30, high: 152.00, low: 149.80, close: 151.20, volume: 4800000 },
    { date: "2024-10-03", open: 151.00, high: 153.50, low: 150.00, close: 152.00, volume: 4600000 }
  ],
  "GOOGL": [
    { date: "2024-10-01", open: 2795.00, high: 2805.00, low: 2780.00, close: 2799.00, volume: 1800000 },
    { date: "2024-10-02", open: 2800.00, high: 2820.00, low: 2795.00, close: 2807.00, volume: 2000000 },
    { date: "2024-10-03", open: 2825.00, high: 2840.00, low: 2810.00, close: 2835.00, volume: 2100000 }
  ]
};



app.get('/api/historicalData', (req, res) => {
  const { ticker, startDate, endDate } = req.query;

  // Check if stock data exists
  if (!historicalData[ticker]) {
    return res.status(404).json({ error: "Ticker not found" });
  }

  // Filter data by date range
  const filteredData = historicalData[ticker].filter(item => {
    const date = new Date(item.date);
    return date >= new Date(startDate) && date <= new Date(endDate);
  });

  // Return the filtered data
  res.json(filteredData);
});


// getting nifty histogram

*/







server.listen(port, () => console.log('Listening on port ' + port));
