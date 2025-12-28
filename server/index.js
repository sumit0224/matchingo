const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for now, restrict in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const actionRoutes = require('./routes/actionRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/auth', authRoutes);
// Legacy compatibility (if needed) or just switch to /user
app.use('/profile', userRoutes); // Mapping /profile to userRoutes for backward compatibility with existing frontend
app.use('/user', userRoutes);
app.use('/action', actionRoutes);
app.use('/chat', chatRoutes);
app.use('/premium', require('./routes/premiumRoutes'));

app.get('/', (req, res) => {
  res.send('Matchingo API is running');
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const initializeDatabase = require('./scripts/initDatabase');

const startServer = async () => {
  try {
    // In production, execute the database initialization script automatically
    if (process.env.NODE_ENV === 'production') {
      console.log('🚀 Production environment detected. Initializing database...');
      await initializeDatabase();
    }
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    // Proceeding might be risky if DB isn't ready, but we'll try running the server anyway
    // OR process.exit(1) to make Render restart.
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
