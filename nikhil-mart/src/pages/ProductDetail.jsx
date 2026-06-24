import { useParams, Link } from "react-router-dom";
import { products, categories } from "../data/products";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import { FiPlus, FiMinus, FiHeart, FiShare2, FiStar, FiTruck, FiShield, FiRefreshCw } from "react-icons/fi";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === Number(id));
  const { cart, addToCart, increment, decrement } = useCart();
  const { isAuthenticated, toggleWishlist, isInWishlist } = useAuth();

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="not-found">
          <h2>Product not found</h2>
          <Link to="/products" className="back-link">Browse Products</Link>
        </div>
      </div>
    );
  }

  const cartItem = cart.find((item) => item.id === product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const category = categories.find((c) => c.id === product.category);
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const wishlisted = isAuthenticated && isInWishlist(product.id);

  return (
    <div className="product-detail-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / {category && (
          <Link to={`/products?category=${category.id}`}>{category.name}</Link>
        )} / <span>{product.name}</span>
      </div>

      <div className="detail-container">
        <div className="detail-image-section">
          <div className="detail-image">
            {discount > 0 && <span className="detail-discount">{discount}% OFF</span>}
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        <div className="detail-info-section">
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-unit">{product.unit}</p>

          <div className="detail-rating">
            <FiStar className="star-filled" />
            <span>{product.rating}</span>
            <span className="rating-count">({Math.floor(Math.random() * 500 + 100)} ratings)</span>
          </div>

          <div className="detail-pricing">
            <span className="detail-price">₹{product.price}</span>
            {discount > 0 && (
              <>
                <span className="detail-original">₹{product.originalPrice}</span>
                <span className="detail-save">You save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          <p className="detail-tax">(Inclusive of all taxes)</p>

          <div className="detail-actions">
            {cartItem ? (
              <div className="detail-qty-control">
                <button onClick={() => decrement(product.id)} className="detail-qty-btn">
                  <FiMinus />
                </button>
                <span className="detail-qty-value">{cartItem.quantity}</span>
                <button onClick={() => increment(product.id)} className="detail-qty-btn">
                  <FiPlus />
                </button>
              </div>
            ) : (
              <button className="detail-add-btn" onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            )}
            <button
              className={`detail-wishlist-btn ${wishlisted ? "wishlisted" : ""}`}
              onClick={() => isAuthenticated && toggleWishlist(product.id)}
              title={isAuthenticated ? "Toggle wishlist" : "Login to add to wishlist"}
            >
              <FiHeart />
            </button>
            <button className="detail-share-btn" title="Share">
              <FiShare2 />
            </button>
          </div>

          <div className="detail-features">
            <div className="feature-item">
              <FiTruck />
              <div>
                <strong>Express Delivery</strong>
                <p>Get it in 10-15 minutes</p>
              </div>
            </div>
            <div className="feature-item">
              <FiShield />
              <div>
                <strong>Quality Guaranteed</strong>
                <p>100% fresh products</p>
              </div>
            </div>
            <div className="feature-item">
              <FiRefreshCw />
              <div>
                <strong>Easy Returns</strong>
                <p>No questions asked</p>
              </div>
            </div>
          </div>

          <div className="detail-description">
            <h3>About this product</h3>
            <p>
              Fresh and high-quality {product.name.toLowerCase()} sourced directly from trusted suppliers.
              Carefully packed to maintain freshness and delivered right to your doorstep.
              Best consumed within 2-3 days of delivery for optimal freshness.
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2>Similar Products</h2>
          <div className="related-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
