# Boutique eCommerce Platform

A modern, luxury eCommerce web application built with a React (Vite) frontend and a Node.js (Express) backend.

## Features

### Frontend (React + Vite)
- **Luxury Aesthetic**: Custom CSS variables, smooth transitions, and premium typography (Playfair Display & Inter).
- **Advanced Filtering & Search**: Real-time AJAX filtering by category, price, size, color, gender, and availability.
- **Customer Accounts**: Full authentication flow (Login/Register) using JWT, with a dedicated Customer Dashboard for orders and wishlists.
- **Admin Dashboard**: Secure, role-based admin panel for managing products (CRUD operations), viewing orders, and managing customers.
- **Dynamic Shopping Cart**: Manage quantities, view order summaries, and proceed to checkout.
- **Contact Page**: NodeMailer integration for sending inquiries directly to the boutique owner, plus Google Maps embed.

### Backend (Node.js + Express + SQLite)
- **RESTful API**: Endpoints for products, orders, authentication, admin controls, and contact forms.
- **Secure Authentication**: Utilizing `bcryptjs` for secure password hashing and `jsonwebtoken` for protected routes.
- **Database**: Lightweight SQLite database handling users, products, categories, and orders.
- **Security Enhancements**: 
  - `helmet` for secure HTTP headers.
  - Parameterized queries to protect against SQL injections.
  - `cors` for safe cross-origin resource sharing.

## Setup Instructions

### 1. Backend Setup
1. Navigate to the \`backend\` directory: \`cd backend\`
2. Install dependencies: \`npm install\`
3. Ensure the \`.env\` file exists with necessary variables:
   \`\`\`
   PORT=5001
   STRIPE_SECRET_KEY=sk_test_dummy_key_not_for_production
   JWT_SECRET=super_secret_boutique_auth_key_12345
   \`\`\`
4. Start the backend server: \`npm start\` (or \`node index.js\`)
   - *Note: The SQLite database (\`database.sqlite\`) will automatically initialize and seed initial dummy products.*

### 2. Frontend Setup
1. Navigate to the \`frontend\` directory: \`cd frontend\`
2. Install dependencies: \`npm install\`
3. Start the Vite development server: \`npm run dev\`

## Admin Usage
To access the Admin panel:
1. Register a new user at \`/login\`
2. By default, new users are 'customer' role. To make an admin, you must manually update the SQLite database \`users\` table to set the role to \`'admin'\` for your email.
3. Once updated, navigate to \`/admin\` to manage the store.

## Contact Form (NodeMailer)
The contact form uses Ethereal email (a fake SMTP service) by default for testing. To use in production, update the \`transporter\` configuration in \`backend/index.js\` with real SMTP credentials.
