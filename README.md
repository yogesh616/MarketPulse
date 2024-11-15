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




{
  "ticker": "AAPL",
  "price": 151.45,
  "volume": 1350
}



setAlert

Triggered by: Client

Parameters:

ticker (string) - The stock ticker.

price (number) - The target alert price.

Description: Sets an alert for a specific price for the specified ticker. When the price condition is met, the server emits an alert event.

Emits:

alert (object) to notify the client when the alert condition is met:

json

Copy code

{
  "ticker": "AAPL",
  "price": 155.00
}

Client-Side Events

stock

Emitted by: Server

Parameters: Stock data object (see structure above).

Description: Receives real-time stock data updates to be displayed on the client interface.

alert

Emitted by: Server

Parameters: Alert data object (see structure above).

Description: Triggers a notification (sound and alert message) when the stock reaches the target price set by the client.

Client Functionality

HTML Structure

Stock Information Display: Displays real-time stock data including ticker, price, and volume.

Set Alert: Input field and button for setting a price alert for specific stocks.

JavaScript (Client-Side)


Socket.IO Connection:


Connects to the server using Socket.IO to receive real-time updates.

Real-time Stock Updates:


Listens to the stock event and dynamically updates the DOM to show the current stock price and volume for a specific ticker.

Setting Alerts:

Users can set an alert for a stock's price using the input field and alert button.

When the stock reaches the specified price, a notification sound and alert message appear.

Local Storage:

Alert prices set by the user are stored in the client’s localStorage to persist data across sessions.

Data Structure

Real-Time Stock Data

json

Copy code

{
  "ticker": "AAPL",
  "price": 151.45,
  "volume": 1350
}

ticker: Stock symbol.

price: Current stock price (randomly generated for this example).

volume: Current trading volume (randomly generated).

Alert Data

json

Copy code

{
  "ticker": "AAPL",
  "price": 155.00
}

ticker: Stock symbol for which the alert is set.

price: Target price that triggers the alert.

Example Usage

Start the Server:


Run node server.js to start the application server.

Access the Client:

Open http://localhost:3000 in a web browser.

Track Stocks in Real-Time:

Select a stock ticker to view its live price and volume data.

Set Alerts:

Enter a target price in the input box and click the "Set Alert" button to receive a notification when the stock reaches that price.

Notes

This project simulates stock data and does not pull live stock information from any external financial API.

This app can be expanded to integrate actual financial APIs for real stock data or additional features like historical data charts and advanced alert conditions.
