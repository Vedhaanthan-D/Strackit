import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import { fetchWishlist } from 'shops-query/src/modules/wishlist/queries/get';
import { removeFromWishlistController } from 'shops-query/src/modules/wishlist/index.js';
import { useToast } from '../../common/components/Toast';
import { HOME_CONFIG, IMAGE_PREFIX } from '../../config/appIds';
import '../styles/Wishlist.css';

// Loading Skeleton for wishlist items
const WishlistSkeleton = () => (
  <div className="wishlistGrid">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="wishlistItemSkeleton">
        <div className="wishlistImageSkeleton"></div>
        <div className="wishlistContentSkeleton">
          <div className="wishlistTitleSkeleton"></div>
          <div className="wishlistPriceSkeleton"></div>
        </div>
      </div>
    ))}
  </div>
);

const Wishlist = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingItems, setRemovingItems] = useState(new Set());

  // Fetch wishlist data
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        const data = await fetchWishlist(HOME_CONFIG.userId, HOME_CONFIG.shopId);
        setWishlistItems(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError(err);
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (productId, productTitle, event) => {
    event.stopPropagation(); // Prevent product click
    
    // Prevent multiple clicks on the same item
    if (removingItems.has(productId)) {
      return;
    }
    
    try {
      // Add to removing items set
      setRemovingItems(prev => new Set(prev).add(productId));
      
      // Call API to remove from wishlist
      await removeFromWishlistController({
        userId: HOME_CONFIG.userId,
        productId: productId,
        shopId: HOME_CONFIG.shopId
      });
      
      // Update UI - remove the item from the list
      setWishlistItems(prevItems => prevItems.filter(item => item.productId !== productId));
      
      // Show success message
      showSuccess(`${productTitle} removed from wishlist!`);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      showError('Failed to remove item from wishlist. Please try again.');
    } finally {
      // Remove from removing items set
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNTAgMTgwQzE2NS4xNTUgMTgwIDE3Ny41IDE2Ny42NTUgMTc3LjUgMTUyLjVDMTc3LjUgMTM3LjM0NSAxNjUuMTU1IDEyNSAxNTAgMTI1QzEzNC44NDUgMTI1IDEyMi41IDEzNy4zNDUgMTIyLjUgMTUyLjVDMTIyLjUgMTY3LjY1NSAxMzQuODQ1IDE4MCAxNTAgMTgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
  };

  return (
    <div className="wishlistContainer">
      {/* Wishlist Header with horizontal line border */}
      <div className="wishlistHeader">
        <h1 className="wishlistTitle">
          WISHLIST {wishlistItems.length > 0 && `(${wishlistItems.length} ITEMS)`}
        </h1>
        <div className="wishlistHeaderBorder"></div>
      </div>

      {/* Loading State */}
      {loading && <WishlistSkeleton />}

      {/* Error State */}
      {error && !loading && (
        <div className="wishlistEmpty">
          <div className="emptyIcon">
            <FiHeart />
          </div>
          <h2>Unable to load wishlist</h2>
          <p>Please try again later.</p>
        </div>
      )}

      {/* Empty Wishlist State */}
      {!loading && !error && wishlistItems.length === 0 && (
        <div className="wishlistEmpty">
          <div className="emptyIcon">
            <FiHeart />
          </div>
          <h2>Your wishlist is empty</h2>
          <p>Add items you love to your wishlist and they'll show up here.</p>
          <button 
            className="shopNowButton"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {!loading && !error && wishlistItems.length > 0 && (
        <div className="wishlistGrid">
          {wishlistItems.map((item) => (
            <div 
              key={item.id}
              className="wishlistItem"
              onClick={() => handleProductClick(item.productId)}
            >
              {/* Wishlist Item Image */}
              <div className="wishlistImageWrapper">
                <img
                  src={`${IMAGE_PREFIX}${item.featureImage}`}
                  alt={item.title}
                  className="wishlistImage"
                  onError={handleImageError}
                />
                
                {/* Remove from Wishlist Button */}
                <button
                  className={`removeWishlistButton ${removingItems.has(item.productId) ? 'removing' : ''}`}
                  onClick={(e) => handleRemoveFromWishlist(item.productId, item.title, e)}
                  disabled={removingItems.has(item.productId)}
                  aria-label="Remove from wishlist"
                >
                  <FiHeart className="heartIconFilled" />
                </button>

                {/* Out of Stock Badge */}
                {item.noStock && (
                  <div className="outOfStockBadge">Out of Stock</div>
                )}
              </div>

              {/* Wishlist Item Details */}
              <div className="wishlistItemContent">
                <h3 className="wishlistItemTitle">{item.title}</h3>
                
                <div className="wishlistItemPricing">
                  {item.discount > 0 ? (
                    <>
                      <span className="wishlistItemPrice">
                        ₹{Math.round(item.prize - (item.prize * item.discount / 100))}
                      </span>
                      <span className="wishlistItemOriginalPrice">
                        ₹{item.prize}
                      </span>
                      <span className="wishlistItemDiscount">
                        {item.discount}% OFF
                      </span>
                    </>
                  ) : (
                    <span className="wishlistItemPrice">₹{item.prize}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
