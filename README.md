<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=Evenzo&fontSize=90&fontAlignY=38&desc=Next-Gen%20Event%20Booking%20Platform&descAlignY=51&descAlign=62" />
</div>

<div align="center">
  
  [![Made with MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)]()
  [![Made with Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)]()
  [![Made with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
  [![Made with Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)]()
  [![Made with Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)]()

</div>

<h2 align="center">🎟️ Beyond a Standard CRUD App</h2>

<p align="center">
  <strong>Evenzo</strong> is a full-stack MERN event booking platform engineered to solve real-world ticketing challenges. From preventing double-booking to managing automated waitlists and ensuring secure entry with QR-based e-tickets, Evenzo is built for scale and reliability.
</p>

---

## ✨ Standout Features

🔥 **Real-time Seat Locking**  
Uses **Socket.io** to put a 10-minute hold on a seat the moment a user begins checkout. If abandoned, the seat instantly becomes available for others—no double booking, ever.

⏳ **Automated Redis Waitlist**  
Sold out? No problem. Users can join a waitlist backed by **Redis**. When a cancellation occurs, the system automatically promotes the next person in line and notifies them via email.

📱 **QR Code E-Ticketing**  
Automatically generates and emails PDF tickets with cryptographically secure, unique QR codes. Admins can scan these at the venue gate to validate entry and prevent ticket fraud.

🧠 **Smart Recommendations**  
A custom Node.js recommendation engine that analyzes past bookings to suggest upcoming events users actually care about.

📊 **Interactive Admin Dashboard**  
A sleek, real-time control panel built with **Recharts** to monitor revenue streams, peak booking hours, and overall event popularity.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Cache / Queues** | Redis |
| **Real-time** | Socket.io |

---

## 📸 Sneak Peek

### Home Page
![Home Page](./screenshots/home.png)

### E-Ticket & QR Code
![E-Ticket](./screenshots/ticket.png)

### Admin Dashboard
![Admin Dashboard](./screenshots/admin.png)

### User Profile
![User Profile](./screenshots/profile.png)

---

## 🚀 Quick Start (Local Setup)

Want to run Evenzo locally? Follow these simple steps.

**1. Clone the repository**
```bash
git clone https://github.com/rohitt-mahato/Evenzo_app.git
cd Evenzo-MERN
```

**2. Install dependencies**
This command installs packages for both frontend and backend simultaneously.
```bash
npm run install:all
```

**3. Environment Variables**
Create a `.env` file in the `server` directory using `.env.example` as a template.
```env
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url # (Optional, but enables the waitlist feature)
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

**4. Fire it up!**
Start both the React client and Express server with one command.
```bash
npm run dev
```

*(Optional) Seed the database with dummy events:*
```bash
npm run seed --prefix server
```

---

<div align="center">
  <p>Built with ❤️ by <b>Rohit Mahato</b></p>
  <a href="https://github.com/rohitt-mahato">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
  <a href="https://www.linkedin.com/in/rohittmahato/">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
</div>
