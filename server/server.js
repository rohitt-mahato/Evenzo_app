const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const ticketRoutes = require('./routes/tickets');
const analyticsRoutes = require('./routes/analytics');
const recommendationRoutes = require('./routes/recommendations');
const { init: initSocket } = require('./utils/socket');
const { recoverStaleLocks } = require('./utils/seatLock');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/evenzo')
  .then(() => {
    console.log('MongoDB Connected');
    // Recover any stale seat locks from before a server restart
    recoverStaleLocks();
  })
  .catch(err => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
