MarketPulse Documentation
Overview
This application is a real-time stock tracking tool built with Node.js, Express, and Socket.IO for the server-side, and HTML and JavaScript on the client-side. The app provides functionalities for:

Real-time stock data updates
Setting alert prices for stocks
Simulated stock price fluctuations
Table of Contents
Installation
Server Configuration
API Endpoints
Socket.IO Events
Client Functionality
Data Structure
Installation
Clone the repository:

bash

git clone https://github.com/yogesh616/marketpulse.git

cd marketpulse

Install dependencies

npm install

Run the server:


node index.js
The server should start on http://localhost:3000.

API Endpoints

GET /api/tickers
Description: Returns a list of available stock tickers.

Response:

200 OK

JSON array of available stock tickers:

{
    "AAPL": {
        "basePrice": 150
    },
    "GOOGL": {
        "basePrice": 2800
    },
    "AMZN": {
        "basePrice": 3400
    },
    "SONY": {
        "basePrice": 1400
    },
    "NASDAQ": {
        "basePrice": 20
    },
    "TSLA": {
        "basePrice": 350
    },
    "MSFT": {
        "basePrice": 418
    },
    "FB": {
        "basePrice": 586
    },
    "NFLX": {
        "basePrice": 805.44
    },
    "BABA": {
        "basePrice": 95.42
    },
    "UBER": {
        "basePrice": 71.67
    },
    "TWTR": {
        "basePrice": 53.7
    }
}


GET /api/single?symbol=AAPL

Description: Retrieves historical data for a given stock ticker.

Parameters:

symbol (string): The stock ticker symbol (e.g., "AAPL").

Response:

200 OK

JSON object containing historical data:














{

    "_id": "6735bb5b0a7822a1e34eeced",

    "symbol": "AAPL",

    "data": [

    {

            "date": "Nov 13, 2024",

            "open": 224.01,

            "high": 226.65,

            "low": 222.76,

            "close": 225.12,

            "adjClose": 225.12,

            "volume": 48528500

    }

         ]

         }



Socket.IO Events

Server-Side Events

getStockData

Triggered by: Client

Parameters: ticker (string) - The stock ticker for which data is requested.

Description: Starts sending real-time stock data updates for the specified ticker every second.

Emits:

stock (object) with simulated data:

json

Copy code


{

  "ticker": "AAPL",
  "price": 151.45,
  "volume": 1350
}
