const { Server } = require('socket.io');

let io;

/**
 * Socket.IO singleton module
 * Allows controllers to access the io instance via getIO()
 * without circular dependency issues.
 */

/**
 * Initialize Socket.IO and attach to the HTTP server
 * @param {http.Server} httpServer
 * @returns {Server} Socket.IO server instance
 */
const init = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE']
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);

        // Join an event-specific room (clients send eventId to subscribe)
        socket.on('join:event', (eventId) => {
            const room = `event:${eventId}`;
            socket.join(room);
            console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
        });

        // Leave an event room
        socket.on('leave:event', (eventId) => {
            const room = `event:${eventId}`;
            socket.leave(room);
            console.log(`[Socket.IO] ${socket.id} left room ${room}`);
        });

        // Join the admin dashboard room
        socket.on('join:admin', () => {
            socket.join('admin');
            console.log(`[Socket.IO] ${socket.id} joined admin room`);
        });

        // Join a user-specific room (for targeted notifications like waitlist)
        socket.on('join:user', (userId) => {
            const room = `user:${userId}`;
            socket.join(room);
            console.log(`[Socket.IO] ${socket.id} joined room ${room}`);
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
        });
    });

    console.log('[Socket.IO] Initialized');
    return io;
};

/**
 * Get the Socket.IO server instance
 * Must be called after init()
 * @returns {Server}
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized — call init(httpServer) first');
    }
    return io;
};

module.exports = { init, getIO };
