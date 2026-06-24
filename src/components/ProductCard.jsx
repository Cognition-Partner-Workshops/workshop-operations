import { useCart } from "../context/CartContext";
import { FiPlus, FiMinus } from "react-icons/fi";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const { cart, addToCart, increment, decrement } = useCart();
  const cartItem = cart.find((item) => item.id === product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="product-card">
      {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
      <div className="product-image">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
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
