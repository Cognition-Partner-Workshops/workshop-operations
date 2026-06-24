import { useState } from "react";
import { offers } from "../data/offers";
import { FiCopy, FiCheck, FiTag } from "react-icons/fi";
import "./Offers.css";

export default function Offers() {
  const [copiedId, setCopiedId] = useState(null);

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="offers-page">
      <div className="offers-hero">
        <h1>Offers & Deals</h1>
        <p>Save big on your grocery orders with these exclusive offers</p>
      </div>

      <div className="offers-list">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-detail-card">
            <div className="offer-color-strip" style={{ background: offer.color }}></div>
            <div className="offer-detail-content">
              <div className="offer-detail-top">
                <div className="offer-icon" style={{ background: offer.color }}>
                  <FiTag />
                </div>
                <div className="offer-detail-info">
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                </div>
              </div>
              <div className="offer-detail-bottom">
                <div className="offer-meta">
                  <span className="offer-min">Min. order: ₹{offer.minOrder}</span>
                  <span className="offer-max">Max discount: ₹{offer.maxDiscount}</span>
                  <span className="offer-valid">Valid till: {new Date(offer.validTill).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="offer-code-section">
                  <span className="offer-code-label">Use code:</span>
                  <button
                    className={`offer-code-btn ${copiedId === offer.id ? "copied" : ""}`}
                    onClick={() => copyCode(offer.code, offer.id)}
                  >
                    <span className="code-text">{offer.code}</span>
                    {copiedId === offer.id ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="offers-terms">
        <h3>Terms & Conditions</h3>
        <ul>
          <li>Offers are valid for limited time only</li>
          <li>Discount coupons cannot be combined with other offers</li>
          <li>Nikhil Mart reserves the right to modify or withdraw offers at any time</li>
          <li>Maximum discount caps apply as mentioned in each offer</li>
        </ul>
      </div>
    </div>
  );
}
