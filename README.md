# 🛍️ LuxeShop — Full Stack MERN E-Commerce

A complete, production-ready e-commerce application built with **MongoDB, Express, React, Node.js**.

---

## 📁 Project Structure

```
ecommerce/
├── backend/          # Express + Node.js API
│   ├── models/       # Mongoose models (User, Product, Order)
│   ├── routes/       # REST API routes
│   ├── middleware/   # Auth middleware (JWT)
│   ├── server.js     # Main server entry point
│   ├── seeder.js     # Database seeder (demo data)
│   └── .env.example  # Environment variables template
│
└── frontend/         # React application
    ├── src/
    │   ├── components/   # Navbar, Footer, ProductCard
    │   ├── pages/        # Home, Products, Cart, Checkout, etc.
    │   ├── context/      # Auth & Cart context (global state)
    │   └── utils/        # Axios API helper
    └── public/
```

---

## ✨ Features

### Storefront
- 🏠 **Homepage** — Hero carousel, category grid, featured products, trust badges
- 🔍 **Product Listing** — Search, filter by category & price, sort, pagination
- 📦 **Product Detail** — Image gallery, reviews, qty selector, add to cart
- 🛒 **Shopping Cart** — Persistent cart (localStorage), qty update, remove items
- 💳 **Checkout** — 3-step wizard (Shipping → Payment → Review)
- 📋 **Order Tracking** — Order history with real-time status

### Auth
- 🔐 JWT-based authentication
- 👤 User registration & login
- ✏️ Profile & address management

### Admin Panel (`/admin`)
- 📊 Dashboard with revenue, orders, users, product stats
- ➕ Add / Edit / Delete products
- 📦 Update order status (pending → processing → shipped → delivered)
- 👥 User management

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 2. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env       # Fill in your MongoDB URI and JWT secret

# Frontend
cd ../frontend
npm install
```

### 3. Configure Environment

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_super_secret_key_here_min_32_chars
NODE_ENV=development
```

### 4. Seed Database (Optional — Demo Data)

```bash
cd backend
node seeder.js
```
This creates:
- ✅ 12 sample products across 6 categories
- ✅ Admin account: `admin@luxeshop.com` / `admin123`

### 5. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
# App running on http://localhost:3000
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| GET | `/api/auth/profile` | Get profile (auth) |
| PUT | `/api/auth/profile` | Update profile (auth) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All products (filter, sort, paginate) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/products/:id/reviews` | Add review (auth) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (auth) |
| GET | `/api/orders/myorders` | My orders (auth) |
| GET | `/api/orders/:id` | Order detail (auth) |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/:id/pay` | Mark as paid |
| PUT | `/api/orders/:id/status` | Update status (admin) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Context API |
| Styling | Pure CSS with CSS Variables, Google Fonts |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| HTTP Client | Axios |
| Dev Tools | nodemon, react-scripts |

---

## 📱 Responsive Breakpoints

- **Desktop**: 1280px+ (full layout)
- **Tablet**: 768px–1100px (adjusted grid)
- **Mobile**: <480px (single column, mobile menu)

---

## 🔒 Security Notes

- Passwords are hashed with bcrypt (salt rounds: 10)
- JWT tokens expire in 30 days
- Admin routes protected by `admin` middleware
- Private routes protected by `protect` middleware
- Never commit `.env` to version control!

---

## 📦 Build for Production

```bash
# Build React frontend
cd frontend
npm run build

# Serve with Express (add to server.js)
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
```

---

*Built with ❤️ using the MERN Stack*
