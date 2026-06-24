import { useCart } from "../context/CartContext";
import { FiPlus, FiMinus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Cart.css";

export default function Cart() {
  const { cart, increment, decrement, removeFromCart, clearCart, totalPrice } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const deliveryFee = totalPrice > 199 ? 0 : 25;
  const grandTotal = totalPrice + deliveryFee;

  const handleCheckout = () => {
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) {
    return (
      <div className="cart-page">
        <div className="order-success">
          <div className="success-icon">🎉</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your groceries will be delivered in 10-15 minutes.</p>
          <Link to="/" className="continue-btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <FiShoppingBag className="empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Add items to your cart and they will appear here.</p>
          <Link to="/products" className="continue-btn">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-items-section">
          <div className="cart-header">
            <h2>Shopping Cart ({cart.length} items)</h2>
            <button className="clear-btn" onClick={clearCart}>
              <FiTrash2 /> Clear Cart
            </button>
          </div>

          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="cart-item-unit">{item.unit}</p>
                  <p className="cart-item-price">₹{item.price}</p>
                </div>
                <div className="cart-item-actions">
                  <div className="cart-qty-control">
                    <button onClick={() => decrement(item.id)} className="cart-qty-btn">
                      <FiMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increment(item.id)} className="cart-qty-btn">
                      <FiPlus />
                    </button>
                  </div>
                  <p className="cart-item-total">₹{item.price * item.quantity}</p>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>{deliveryFee === 0 ? <span className="free-delivery">FREE</span> : `₹${deliveryFee}`}</span>
          </div>
          {deliveryFee > 0 && (
            <p className="free-delivery-note">Add ₹{199 - totalPrice} more for free delivery</p>
          )}
          <div className="summary-divider"></div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span>₹{grandTotal}</span>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Place Order - ₹{grandTotal}
          </button>
          <p className="delivery-note">⚡ Estimated delivery in 10-15 minutes</p>
        </div>
      </div>
    </div>
  );
}
