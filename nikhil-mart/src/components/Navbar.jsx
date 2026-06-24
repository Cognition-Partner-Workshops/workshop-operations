import { Link, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiSearch, FiMenu, FiUser, FiTag } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const { totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu />
          </button>
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🛒</span>
            <span className="brand-name">Nikhil Mart</span>
          </Link>
          <div className="delivery-info">
            <span className="delivery-time">⚡ Delivery in 10 mins</span>
            <span className="delivery-location">Home - Sector 17, Gurgaon</span>
          </div>
        </div>

        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="navbar-right">
          <Link to="/offers" className="nav-link"><FiTag className="nav-icon" /> Offers</Link>
          <Link to="/products" className="nav-link">All Products</Link>
          {isAuthenticated ? (
            <Link to="/profile" className="user-btn" title={user.name}>
              <FiUser />
            </Link>
          ) : (
            <Link to="/login" className="nav-link login-link">Login</Link>
          )}
          <Link to="/cart" className="cart-btn">
            <FiShoppingCart />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)}>All Products</Link>
          <Link to="/offers" onClick={() => setMenuOpen(false)}>Offers</Link>
          {isAuthenticated ? (
            <Link to="/profile" onClick={() => setMenuOpen(false)}>My Account</Link>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login / Signup</Link>
          )}
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({totalItems})</Link>
        </div>
      )}
    </nav>
  );
}
