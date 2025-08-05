import express from "express";
import dotenv from "dotenv";
import { Server, Socket } from "socket.io";
import cors from "cors";
import { startStockPriceSimulation } from "./services/stockPriceSimulator";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({origin: CORS_ORIGIN}));

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = new socket.Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// Define the types for our Socket.IO events for better type safety
interface ServerToClientEvents {
  stockPriceUpdate: (data: { ticker: string; price: number; timestamp: number }) => void;
  // You can add more events here as your platform grows
  // e.g., 'tradeConfirmation': (data: { orderId: string, status: string }) => void;
}

interface ClientToServerEvents {
  subscribeToStock: (ticker: string) => void;
  unsubscribeFromStock: (ticker: string) => void;
  // e.g., 'placeOrder': (order: { ticker: string, type: 'buy' | 'sell', quantity: number, price?: number }) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  userId: string;
  // You can attach any data relevant to the socket connection here
}

// Socket.IO Connection Handling
io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  console.log(`Client connected: ${socket.id}`);

  // When a client subscribes to a stock ticker
  socket.on('subscribeToStock', (ticker: string) => {
    // Join a "room" specific to the stock ticker.
    // This allows us to send updates only to clients interested in that stock.
    socket.join(ticker);
    console.log(`Client ${socket.id} subscribed to ${ticker}`);
    // Optionally, send the current price immediately upon subscription
    // (We'll implement this more robustly later if needed, for now simulator just broadcasts)
  });

  // When a client unsubscribes from a stock ticker
  socket.on('unsubscribeFromStock', (ticker: string) => {
    socket.leave(ticker);
    console.log(`Client ${socket.id} unsubscribed from ${ticker}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the stock price simulation and broadcast updates
startStockPriceSimulation(io);

// Basic Express route (optional, but good for health checks)
app.get('/', (req, res) => {
  res.send('Trading Platform Backend is running!');
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`CORS_ORIGIN for Socket.IO is: ${CORS_ORIGIN}`);
});

export { io };