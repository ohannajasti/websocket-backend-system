// trading-platform-backend/src/services/stockPriceSimulator.ts
import { Server } from 'socket.io';

// Define the shape of our stock data
interface StockPrice {
  ticker: string;
  price: number;
  timestamp: number;
}

// Initial prices for our simulated stocks
const stockPrices: { [key: string]: number } = {
  AAPL: 170.00,
  MSFT: 420.00,
  GOOGL: 180.00,
  AMZN: 190.00,
  TSLA: 200.00
};

// Function to simulate price fluctuations
const simulatePriceChange = (currentPrice: number): number => {
  const minChange = -0.5; // Minimum price change
  const maxChange = 0.5;  // Maximum price change
  const change = Math.random() * (maxChange - minChange) + minChange;
  const newPrice = currentPrice + change;
  return parseFloat(newPrice.toFixed(2)); // Keep to 2 decimal places
};

export const startStockPriceSimulation = (io: Server) => {
  // Simulate price updates every 1.5 seconds (adjust as needed)
  setInterval(() => {
    for (const ticker in stockPrices) {
      if (stockPrices.hasOwnProperty(ticker)) {
        stockPrices[ticker] = simulatePriceChange(stockPrices[ticker]);

        const stockUpdate: StockPrice = {
          ticker: ticker,
          price: stockPrices[ticker],
          timestamp: Date.now(),
        };

        // Emit the update to all clients in the specific stock's room
        // Only clients who have 'subscribed' to this ticker will receive it.
        io.to(ticker).emit('stockPriceUpdate', stockUpdate);
        // console.log(`Emitted update for ${ticker}: ${stockUpdate.price}`); // Uncomment for debugging
      }
    }
  }, 1500); // 1500 milliseconds = 1.5 seconds
};