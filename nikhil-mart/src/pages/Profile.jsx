import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMapPin, FiPackage, FiHeart, FiLogOut, FiPlus, FiTrash2, FiStar } from "react-icons/fi";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import "./Profile.css";

export default function Profile() {
  const {
    user, isAuthenticated, logout, updateProfile,
    addAddress, removeAddress, setDefaultAddress,
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    address: "",
    city: "",
    pincode: "",
  });

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleSaveProfile = () => {
    updateProfile(editData);
    setEditing(false);
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (addressForm.address && addressForm.city && addressForm.pincode) {
      addAddress({ ...addressForm, isDefault: (user.addresses || []).length === 0 });
      setAddressForm({ label: "Home", address: "", city: "", pincode: "" });
      setShowAddressForm(false);
    }
  };

  const wishlistProducts = products.filter((p) => (user.wishlist || []).includes(p.id));

  const tabs = [
    { id: "profile", label: "My Profile", icon: <FiUser /> },
    { id: "addresses", label: "Addresses", icon: <FiMapPin /> },
    { id: "orders", label: "Orders", icon: <FiPackage /> },
    { id: "wishlist", label: "Wishlist", icon: <FiHeart /> },
  ];

  return (
    <div className="profile-page">
      <div className="profile-sidebar">
        <div className="profile-avatar">
          <div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
        <nav className="profile-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`profile-nav-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          <button className="profile-nav-btn logout-btn" onClick={() => { logout(); navigate("/"); }}>
            <FiLogOut /> Logout
          </button>
        </nav>
      </div>

      <div className="profile-content">
        {activeTab === "profile" && (
          <div className="profile-section">
            <h2>Personal Information</h2>
            {editing ? (
              <div className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    value={editData.name ?? user.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    value={editData.email ?? user.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    value={editData.phone ?? user.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  />
                </div>
                <div className="profile-form-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
                  <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="profile-info">
                <div className="info-row"><label>Name</label><span>{user.name}</span></div>
                <div className="info-row"><label>Email</label><span>{user.email}</span></div>
                <div className="info-row"><label>Phone</label><span>{user.phone}</span></div>
                <button className="edit-btn" onClick={() => { setEditData({}); setEditing(true); }}>
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="profile-section">
            <div className="section-top">
              <h2>Saved Addresses</h2>
              <button className="add-new-btn" onClick={() => setShowAddressForm(true)}>
                <FiPlus /> Add New
              </button>
            </div>

            {showAddressForm && (
              <form className="address-form" onSubmit={handleAddAddress}>
                <div className="address-type-btns">
                  {["Home", "Work", "Other"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      className={`type-btn ${addressForm.label === label ? "active" : ""}`}
                      onClick={() => setAddressForm({ ...addressForm, label })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="form-group">
                  <input
                    placeholder="Full address"
                    value={addressForm.address}
                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    required
                  />
                </div>
                <div className="profile-form-actions">
                  <button type="submit" className="save-btn">Save Address</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            <div className="addresses-list">
              {(user.addresses || []).length === 0 ? (
                <p className="empty-text">No saved addresses yet. Add one above!</p>
              ) : (
                user.addresses.map((addr) => (
                  <div key={addr.id} className={`address-card ${addr.isDefault ? "default" : ""}`}>
                    <div className="address-label">
                      <span className="label-tag">{addr.label}</span>
                      {addr.isDefault && <span className="default-tag">Default</span>}
                    </div>
                    <p className="address-text">{addr.address}</p>
                    <p className="address-city">{addr.city} - {addr.pincode}</p>
                    <div className="address-actions">
                      {!addr.isDefault && (
                        <button className="set-default-btn" onClick={() => setDefaultAddress(addr.id)}>
                          Set as Default
                        </button>
                      )}
                      <button className="remove-addr-btn" onClick={() => removeAddress(addr.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="profile-section">
            <h2>Order History</h2>
            {(user.orders || []).length === 0 ? (
              <div className="empty-state">
                <FiPackage className="empty-state-icon" />
                <p>No orders yet</p>
                <Link to="/products" className="shop-link">Start Shopping</Link>
              </div>
            ) : (
              <div className="orders-list">
                {user.orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <span className="order-id">Order #{order.id}</span>
                        <span className="order-date">{order.date}</span>
                      </div>
                      <span className={`order-status ${order.status}`}>{order.status}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <p className="order-item-name">{item.name}</p>
                            <p className="order-item-qty">Qty: {item.quantity} x ₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-footer">
                      <span className="order-total">Total: ₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="profile-section">
            <h2>My Wishlist</h2>
            {wishlistProducts.length === 0 ? (
              <div className="empty-state">
                <FiHeart className="empty-state-icon" />
                <p>Your wishlist is empty</p>
                <Link to="/products" className="shop-link">Browse Products</Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {wishlistProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
