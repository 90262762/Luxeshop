import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GoogleAuthSuccess from "./pages/GoogleAuthSuccess";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import ScrollToTop from './components/ScrollToTop';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import { Login, Register } from "./pages/Auth";
import Checkout from "./pages/Checkout";
import { Orders, OrderDetail } from "./pages/Orders";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Wishlist from "./pages/Wishlist";
import OTPVerify from "./pages/OTPVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { NotificationProvider } from "./context/NotificationContext";
import HelpCenter    from './pages/HelpCenter';
import ContactUs     from './pages/ContactUs';
import ReturnPolicy  from './pages/ReturnPolicy';



const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.isAdmin ? children : <Navigate to="/" />;
};

const App = () => (
  <AuthProvider>
    <CartProvider>
      <WishlistProvider>
        <NotificationProvider>
          <Router>
             <ScrollToTop />
            {" "}
            {/* ✅ Router is INSIDE providers */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <Navbar />

              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-otp" element={<OTPVerify />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/checkout"
                    element={
                      <PrivateRoute>
                        <Checkout />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <PrivateRoute>
                        <Orders />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/orders/:id"
                    element={
                      <PrivateRoute>
                        <OrderDetail />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/wishlist"
                    element={
                      <PrivateRoute>
                        <Wishlist />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/help"          element={<HelpCenter />} />
<Route path="/contact"       element={<ContactUs />} />
<Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <Admin />
                      </AdminRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                  <Route
                    path="/auth/google/success"
                    element={<GoogleAuthSuccess />}
                  />
                  
                </Routes>
              </main>
              <Footer />
            </div>
            <ToastContainer position="bottom-right" autoClose={3000} />
          </Router>
        </NotificationProvider>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
