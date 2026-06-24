import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🛒 Nikhil Mart</h3>
          <p>Your trusted grocery delivery partner. Get fresh groceries delivered to your doorstep in minutes.</p>
        </div>
        <div className="footer-section">
          <h4>Categories</h4>
          <ul>
            <li>Fruits & Vegetables</li>
            <li>Dairy & Bread</li>
            <li>Snacks & Beverages</li>
            <li>Staples</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>About Us</li>
            <li>Contact</li>
            <li>FAQs</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <ul>
            <li>support@nikhilmart.com</li>
            <li>+91 98765 43210</li>
            <li>Sector 17, Gurgaon</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 Nikhil Mart. All rights reserved.</p>
      </div>
    </footer>
  );
}
