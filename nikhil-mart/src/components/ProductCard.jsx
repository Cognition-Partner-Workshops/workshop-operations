import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiMinus, FiHeart } from "react-icons/fi";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { cart, addToCart, increment, decrement } = useCart();
  const { isAuthenticated, toggleWishlist, isInWishlist } = useAuth();
  const cartItem = cart.find((item) => item.id === product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const wishlisted = isAuthenticated && isInWishlist(product.id);

  return (
    <div className="product-card">
      {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
      {isAuthenticated && (
        <button
          className={`card-wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
          onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        >
          <FiHeart />
        </button>
      )}
      <Link to={`/product/${product.id}`} className="product-image-link">
        <div className="product-image">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name-link">
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-unit">{product.unit}</p>
        <div className="product-pricing">
          <span className="product-price">₹{product.price}</span>
          {discount > 0 && (
            <span className="product-original-price">₹{product.originalPrice}</span>
          )}
        </div>
      </div>
      <div className="product-action">
        {cartItem ? (
          <div className="quantity-control">
            <button onClick={() => decrement(product.id)} className="qty-btn">
              <FiMinus />
            </button>
            <span className="qty-value">{cartItem.quantity}</span>
            <button onClick={() => increment(product.id)} className="qty-btn">
              <FiPlus />
            </button>
          </div>
        ) : (
          <button className="add-btn" onClick={() => addToCart(product)}>
            ADD
          </button>
        )}
      </div>
    </div>
  );
}
