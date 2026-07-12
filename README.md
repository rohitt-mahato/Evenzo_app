# Evenzo - Event Booking Platform

Evenzo is a full-stack event booking platform I built using the MERN stack. I wanted to build something beyond a standard CRUD app, so I focused on solving real-world problems like double-booking and ticket fraud. 

It handles real-time seat locking, automatic waitlists, and QR-based e-tickets.

## What it does

- **Real-time Seat Locking**: Uses Socket.io to hold a seat for 10 minutes while a user checks out. If they don't buy it, the seat is released back to everyone.
- **Automated Waitlist**: Built with Redis. If an event is sold out, users can join a waitlist. When someone cancels, the next person in line is automatically promoted and notified.
- **QR Code E-Ticketing**: Generates PDF tickets with unique QR codes. Admins can scan them at the gate to verify if a ticket is valid and ensure it's only used once.
- **Smart Recommendations**: A custom recommendation engine built in Node.js that suggests events based on what you've booked in the past.
- **Admin Dashboard**: A clean dashboard using Recharts to track revenue, peak booking hours, and event popularity.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Cache & Queue**: Redis
- **Real-time**: Socket.io

## How to run it locally

1. Clone the project:
   ```bash
   git clone https://github.com/rohitt-mahato/Evenzo.git
   cd Evenzo-MERN
   ```

2. Install the dependencies for both the frontend and backend:
   ```bash
   npm run install:all
   ```

3. Create a `.env` file inside the `server` folder. You can use `.env.example` as a reference. You'll need:
   - `MONGO_URI`
   - `REDIS_URL` (optional, but waitlist features will be disabled without it)
   - `JWT_SECRET`
   - `EMAIL_USER` & `EMAIL_PASS` (for sending OTPs and tickets)

4. Run the app:
   ```bash
   npm run dev
   ```
   This will start both the React frontend and the Express backend at the same time.

*(Optional)* You can populate the database with some dummy events by running `npm run seed --prefix server`.

## Screenshots

*(I will add screenshots here soon once the app is fully deployed!)*

---
Built by Rohit Mahato | [GitHub](https://github.com/rohitt-mahato) | [LinkedIn](https://www.linkedin.com/in/rohittmahato/)
