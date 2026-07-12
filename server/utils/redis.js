const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            // Stop retrying after 2 attempts to avoid spamming the console
            if (retries >= 2) {
                return new Error('Redis connection failed');
            }
            return 1000; 
        }
    }
});

let errorLogged = false;
redisClient.on('error', (err) => {
    if (!errorLogged) {
        console.warn('\n⚠️ [Redis Warning] Could not connect to Redis on localhost:6379.');
        console.warn('⚠️ Waitlist features will be disabled until Redis is started.\n');
        errorLogged = true;
    }
});

redisClient.on('connect', () => {
    console.log('[Redis] Connected to Redis server');
    errorLogged = false; // Reset if it ever reconnects
});

// Immediately connect the client, catch to prevent unhandled rejection
redisClient.connect().catch(() => {});

module.exports = redisClient;
