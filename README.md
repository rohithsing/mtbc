<div align="center">
  <h1>🎬 PictureDekho</h1>
  <p>A premium, full-stack movie theater booking platform built with the modern MERN/PERN stack.</p>
</div>

<br />

## 🌟 Overview

**PictureDekho** is a sophisticated, production-ready Movie Theater Booking Web Application. It provides a seamless user experience for browsing a wide array of movies, viewing dynamic showtimes across multiple specialized screens (up to 8 screens), and reserving seats in real-time. Designed with premium aesthetics and robust business logic, the platform ensures precise auditing, automated communications, and strict cancellation policies.

---

## ✨ Key Features

- **Interactive & Scalable Seat Selection:** A highly responsive grid per screen (Scale: 1.3x seats, 1.5x row labels) providing visual feedback on available, booked, and voided seats.
- **Advanced Cancellation Policy:**
  - **Single-Attempt Limit:** Cancellations (partial or full) are allowed only once per booking ID.
  - **Dynamic Refund Logic:** 
    - *Before 1 hour of screening:* Refund initiated within 2 days.
    - *Within 1 hour of screening:* No money refund issued.
  - **Post-Cancellation Visibility:** Users can see exactly which seats were cancelled and which remain active in their portal.
- **Dedicated "My Bookings" Portal:** A centralized dashboard for users to track their booking IDs, seat statuses (Active vs Voided), and total amounts.
- **Extensive Theater Capacity:** Supporting up to 8 dedicated screens (Screen A through Screen H) with multiple showtimes per day.
- **Smart Email Notifications:** Automated, itemized booking confirmations and detailed cancellation receipts with refund status clarity.
- **Secure Authentication:** User login leveraging Google OAuth 2.0 via Passport.js and secure JWT-based session management.

---

## 🛠️ Tech Stack

### Frontend (Client-Side)
- **Library/Framework:** React 19 (via Vite)
- **Styling:** Vanilla CSS (Refined for PictureDekho) & Tailwind CSS 4.0
- **Routing:** React Router v7
- **Date Handling:** `date-fns` for precise time-sensitive UI logic
- **Notifications:** React Hot Toast for instant UX feedback

### Backend (Server-Side)
- **Runtime:** Node.js
- **Framework:** Express.js 5.x
- **Database ORM:** Prisma
- **Database Engine:** MySQL
- **Authentication:** Passport.js (Google OAuth2.0), JSON Web Tokens (JWT)
- **Email Service:** Nodemailer + Mailgen

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MySQL](https://www.mysql.com/) database server
- SMTP credentials for email notifications

### 1. Clone the Repository

```bash
git clone https://github.com/rohithsing/mtbc.git
cd mtbc
```

### 2. Backend Setup

```bash
# Install backend dependencies
npm install

# Setup environment variables in .env
# Important: DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, EMAIL_USERNAME, EMAIL_PASSWORD

# Generate Prisma Client
npx prisma generate

# Push Prisma Database Schema
npx prisma db push

# Seed the database (Today's movies & 8 Screens)
node seed.js

# Start the development server
npm run dev
```

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to the frontend directory
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 💡 Usage Highlights

1. **Branding**: The platform has been fully rebranded to **PictureDekho** throughout the footer, navigation, and automated emails.
2. **Date Engine**: Showtimes are dynamically anchored to the current date, ensuring shows are always available from today onwards.
3. **Seating Layout**: Specific movies are assigned to dedicated screens (e.g., **Chandramukhi** on Screen G, **Khaleja** on Screen H) to simulate a real multiplex environment.
4. **Cancellations**: Users can freely choose to cancel partially or fully, but the system strictly enforces the "once per booking" rule to ensure transactional integrity.

---

## 📜 License

{{ ... }}
