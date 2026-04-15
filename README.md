<div align="center">
  <h1>🎬 MTBC (Movie Ticket Booking Center)</h1>
  <p>A full-stack, scalable movie theater booking platform built with the modern MERN/PERN stack.</p>
</div>

<br />

## 🌟 Overview

**MTBC** is a robust, production-ready Movie Theater Booking Web Application. It provides a seamless user experience for browsing movies, viewing showtimes across multiple screens, and reserving seats in real-time. Designed with scalability and reliability in mind, the platform enforces strict business logic, such as time-sensitive cancellations and robust seat-grid mechanisms.

This project perfectly balances a beautiful user interface with a high-performance backend, ensuring quick load times, precise auditing, and automated communications.

---

## ✨ Key Features

- **Interactive Seat Selection:** A highly responsive 40-seat (or dynamically sized) grid per screen, providing visual feedback on available, booked, and selected seats.
- **Strict Booking Logic:** Built-in safeguards including an automated 1-hour pre-screening cancellation policy to prevent last-minute refunds and ensure maximum theater capacity.
- **Smart Email Notifications:** Automated, itemized booking confirmations and cancellation receipts sent directly to users via tailored HTML emails (powered by Nodemailer & Mailgen).
- **Secure Authentication:** Seamless user login leveraging Google OAuth 2.0 via Passport.js and secure JWT-based session management.
- **Relational Integrity:** Advanced relational database modeling handling 1-to-N and N-to-M relationships seamlessly (Movies, Screens, Shows, Seats, Bookings, Users).

---

## 🛠️ Tech Stack

### Frontend (Client-Side)
- **Library/Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS 4.0
- **Routing:** React Router v7
- **Date Handling:** `date-fns` for precise time-sensitive UI logic
- **Notifications:** React Hot Toast for instant UX feedback

### Backend (Server-Side)
- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database ORM:** Prisma
- **Database Engine:** MySQL (Configurable for PostgreSQL)
- **Authentication:** Passport.js (Google OAuth2.0), JSON Web Tokens (JWT)
- **Email Service:** Nodemailer + Mailgen

---

## 📐 Database Architecture

The backend operates on a strictly structured schema optimized for fast queries and transaction safety:

- **Movies**: Core movie details and durations.
- **Screens**: Physical theater halls with total seat capacities.
- **Seats**: Individual seat allocations tied to specific screens.
- **Shows**: Specific showtimes tying a Movie and a Screen together with pricing.
- **Users**: Authenticated users managed via OAuth/Local credentials.
- **Bookings & BookingSeats**: Transactional records tracking revenue, cancellation timestamps, and precise seat ownership per show.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MySQL](https://www.mysql.com/) database server running locally or via cloud
- Basic understanding of environment variables

### 1. Clone the Repository

```bash
git clone https://github.com/rohithsing/mtbc.git
cd mtbc
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Setup environment variables
# Create a .env file in the root based on .env.example
# Important keys needed: DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, etc.

# Push Prisma Database Schema
npx prisma db push

# Start the development server
npm run dev
# Server generally runs at http://localhost:5000
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
# Frontend generally runs at http://localhost:5173
```

---

## 💡 Usage Highlights for Clients

1. **User Flow**: Simply login using a Google account to instantly start booking.
2. **Dashboard**: Users can view their past and upcoming bookings, complete with total amounts and specific seat numbers.
3. **Cancellations**: Requesting a cancellation automatically calculates eligibility (must be > 1 hr before showtime) and frees up the seat in real-time, dispatching an immediate email confirmation.
4. **Admin Ready**: The relational database allows easy extension for an Admin Dashboard to manage movies, pricing, and screens.

---

## 📜 License

This project is licensed under the ISC License. 
