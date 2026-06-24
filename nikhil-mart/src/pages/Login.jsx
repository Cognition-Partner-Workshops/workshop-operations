import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/profile");
    return null;
  }

  const validate = () => {
    const newErrors = {};
    if (isSignup && !formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Enter 10-digit phone number";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Min 6 characters";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    login({
      name: formData.name || formData.email.split("@")[0],
      email: formData.email,
      phone: formData.phone,
    });
    navigate("/");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="login-brand-icon">🛒</span>
            <h1>Nikhil Mart</h1>
          </div>
          <p className="login-tagline">Fresh groceries delivered to your doorstep in 10 minutes</p>
          <div className="login-features">
            <div className="login-feature">🥬 Fresh Fruits & Vegetables</div>
            <div className="login-feature">🥛 Dairy & Bakery Products</div>
            <div className="login-feature">⚡ Lightning Fast Delivery</div>
            <div className="login-feature">💰 Best Prices Guaranteed</div>
          </div>
        </div>

        <div className="login-right">
          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p className="login-subtitle">
            {isSignup ? "Sign up to start shopping" : "Login to your account"}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {isSignup && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
              {errors.phone && <span className="form-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="login-submit-btn">
              {isSignup ? "Create Account" : "Login"}
            </button>
          </form>

          <p className="login-toggle">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => { setIsSignup(!isSignup); setErrors({}); }} className="toggle-btn">
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <button
            className="google-btn"
            onClick={() => {
              login({ name: "Guest User", email: "guest@nikhilmart.com", phone: "9876543210" });
              navigate("/");
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
