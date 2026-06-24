import { Link } from "react-router-dom";
import { categories, products, bannerOffers } from "../data/products";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home() {
  const featuredProducts = products.filter((p) => p.rating >= 4.5).slice(0, 8);
  const bestDeals = products
    .filter((p) => p.originalPrice > p.price)
    .sort((a, b) => {
      const discA = (a.originalPrice - a.price) / a.originalPrice;
      const discB = (b.originalPrice - b.price) / b.originalPrice;
      return discB - discA;
    })
    .slice(0, 8);

  return (
    <div className="home">
      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <h1>Groceries delivered in <span className="highlight">10 minutes</span></h1>
          <p>Get fresh fruits, vegetables, dairy and more delivered to your doorstep</p>
          <Link to="/products" className="hero-cta">Shop Now</Link>
        </div>
        <div className="hero-visual">
          <div className="hero-emoji">🛒🥬🥛🍎</div>
        </div>
      </section>

      {/* Offer Banners */}
      <section className="offers-section">
        <div className="offers-grid">
          {bannerOffers.map((offer) => (
            <Link to="/products" key={offer.id} className="offer-card" style={{ background: offer.color }}>
              <h3>{offer.title}</h3>
              <p>{offer.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products" className="see-all">See All →</Link>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link to={`/products?category=${cat.id}`} key={cat.id} className="category-card">
              <div className="category-icon">{cat.icon}</div>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2>Top Picks for You</h2>
          <Link to="/products" className="see-all">See All →</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Deals */}
      <section className="section">
        <div className="section-header">
          <h2>Best Deals</h2>
          <Link to="/products" className="see-all">See All →</Link>
        </div>
        <div className="products-grid">
          {bestDeals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
