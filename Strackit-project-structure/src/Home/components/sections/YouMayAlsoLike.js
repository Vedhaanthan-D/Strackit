import React, { useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MdNote, MdLocalOffer, MdLocalShipping } from 'react-icons/md';
import '../styles/YouMayAlsoLike.css';

const YouMayAlsoLike = ({ 
  products = [
    { id: 1, name: "Nira Voux", price: 70.00, originalPrice: 80.00, image: "https://via.placeholder.com/120x120/f0f0f0/666?text=Bag" },
    { id: 2, name: "Vixa M", price: 60.00, originalPrice: null, image: "https://via.placeholder.com/120x120/f0f0f0/666?text=Top" }
  ],
  total = 60.00,
  onAddToCart = (productId) => console.log('Add to cart:', productId)
}) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 200;
      const currentScrollLeft = carouselRef.current.scrollLeft;
      const targetScrollLeft = direction === 'left' 
        ? currentScrollLeft - scrollAmount 
        : currentScrollLeft + scrollAmount;
      
      carouselRef.current.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleAddToCart = (product) => {
    onAddToCart(product.id);
  };

  return (
    <div className="you-may-also-like-container">
      {/* Header with navigation */}
      <div className="ymal-header">
        <h3 className="ymal-title">You may also like</h3>
        <div className="ymal-nav">
          <button 
            className="ymal-nav-btn"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FiChevronLeft size={16} />
          </button>
          <button 
            className="ymal-nav-btn"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Product carousel */}
      <div className="ymal-carousel" ref={carouselRef}>
        {products.map((product) => (
          <div key={product.id} className="ymal-item">
            <div className="ymal-image">
              <img 
                src={product.image} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/120x120/f0f0f0/666?text=Product';
                }}
              />
            </div>
            <div className="ymal-details">
              <h4 className="ymal-name">{product.name}</h4>
              <div className="ymal-price">
                <span className="ymal-current-price">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="ymal-original-price">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
              <button 
                className="ymal-add-btn"
                onClick={() => handleAddToCart(product)}
              >
                + Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons row */}
      <div className="ymal-actions">
        <button className="ymal-action-btn">
          <MdNote className="ymal-action-icon" />
          <span>Order Note</span>
        </button>
        <button className="ymal-action-btn">
          <MdLocalOffer className="ymal-action-icon" />
          <span>Coupon</span>
        </button>
        <button className="ymal-action-btn">
          <MdLocalShipping className="ymal-action-icon" />
          <span>Shipping</span>
        </button>
      </div>

      {/* Total section */}
      <div className="ymal-total">
        <div className="ymal-total-line">
          <span className="ymal-total-label">Total</span>
          <span className="ymal-total-amount">${total.toFixed(2)}</span>
        </div>
        <p className="ymal-tax-note">
          Taxes and <span className="ymal-shipping-link">shipping</span> calculated at checkout
        </p>
      </div>
    </div>
  );
};

export default YouMayAlsoLike;