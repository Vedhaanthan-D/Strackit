import React, { useState, useEffect } from 'react';
import { fetchProducts } from 'shops-query/src/modules/products/queries/get.js';
import { IMAGE_PREFIX } from '../../config/appIds.js';
import '../styles/ProductSupremeQuality.css';

const ProductSupremeQuality = ({ product, productId }) => {
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductFeatures = async () => {
      try {
        setLoading(true);
        setError(null);

        if (productId) {
          // Fetch detailed product data
          const detailedProduct = await fetchProducts({ productId: productId });
          
          if (detailedProduct) {
            setProductData(detailedProduct);
          } else {
            setError('Product features not found');
          }
        } else if (product) {
          // Use existing product data
          setProductData(product);
        }
      } catch (err) {
        setError('Failed to load product features');
      } finally {
        setLoading(false);
      }
    };

    fetchProductFeatures();
  }, [productId, product]);

  // Extract features from product data
  const extractFeatures = (data) => {
    if (!data) return [];

    const features = [];

    // Feature 1: Information Product (from description)
    if (data.description) {
      features.push({
        id: 1,
        title: 'Information Product',
        description: stripHtmlTags(data.description),
        image: data.featureImage || data.productImage?.[0]?.image || null,
        type: 'description'
      });
    }

    // Feature 2: Fabricae Material (from specification)
    if (data.specification) {
      features.push({
        id: 2,
        title: 'Fabricae Material',
        description: stripHtmlTags(data.specification).substring(0, 200) + '...',
        image: data.productImage?.[1]?.image || data.featureImage || null,
        type: 'specification'
      });
    }

    // Feature 3: Instructions (from howToUse or otherInformation)
    if (data.howToUse || data.otherInformation) {
      features.push({
        id: 3,
        title: 'Instructions',
        description: stripHtmlTags(data.howToUse || data.otherInformation),
        image: data.productImage?.[2]?.image || data.featureImage || null,
        type: 'instructions'
      });
    }

    // Fill with default features if we don't have enough
    while (features.length < 3) {
      features.push({
        id: features.length + 1,
        title: getDefaultFeatureTitle(features.length),
        description: getDefaultFeatureDescription(features.length),
        image: data.featureImage || null,
        type: 'default'
      });
    }

    return features.slice(0, 3); // Always return exactly 3 features
  };

  // Strip HTML tags from text
  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  };

  // Default feature titles
  const getDefaultFeatureTitle = (index) => {
    const titles = ['Product Information', 'Material Quality', 'Usage Instructions'];
    return titles[index] || 'Product Feature';
  };

  // Default feature descriptions
  const getDefaultFeatureDescription = (index) => {
    const descriptions = [
      'Flexible consilium: Design res ad usus multos et spatia apta, flexibilitatem et commodum usoribus afferens.',
      'Alta durabilitas: alta qualitas materiae et processus fabricandi provectae utens productum habet longam restem et capacitatem bonam sustinens.',
      'Facilis utendum est: User-amica interface et experientia consilium, simplex et facile ad intelligendum, adjuvans utentes utentes facto facili et commode.'
    ];
    return descriptions[index] || 'Premium product feature designed for optimal user experience.';
  };

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDUwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMTUwQzIyNSAxNTAgMjA1IDE3MCAyMDUgMTk1QzIxMCAxODggMjE4IDE4MyAyMjcgMTgzQzIzNiAxODMgMjQ0IDE4OCAyNDkgMTk1QzI1MiAxOTggMjU4IDE5OCAyNjEgMTk1QzI2NiAxODggMjc0IDE4MyAyODMgMTgzQzI5MiAxODMgMzAwIDE4OCAzMDUgMTk1QzMwNSAxNzAgMjg1IDE1MCAyNjAgMTUwSDI1MFoiIGZpbGw9IiNEMUQxRDEiLz4KPC9zdmc+';
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-supreme-quality">
        <div className="supreme-quality-container">
          <div className="supreme-quality-header">
            <div className="title-skeleton"></div>
            <div className="description-skeleton"></div>
          </div>
          <div className="supreme-quality-features">
            {[1, 2, 3].map(i => (
              <div key={i} className="feature-skeleton">
                <div className="feature-image-skeleton"></div>
                <div className="feature-content-skeleton">
                  <div className="feature-title-skeleton"></div>
                  <div className="feature-description-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="product-supreme-quality">
        <div className="supreme-quality-container">
          <div className="supreme-quality-error">
            <p>Unable to load product features. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const features = extractFeatures(productData);

  return (
    <div className="product-supreme-quality">
      <div className="supreme-quality-container">
        {/* Header Section */}
        <div className="supreme-quality-header">
          <h2 className="supreme-quality-title">Product Supreme Quality</h2>
          <p className="supreme-quality-description">
            {productData?.name ? 
              `Labore omnis sint totam maxime. Reprehenderit eaque consectetur consequuntur ullam consequuntur voluptatem. Eius voluptatem molestias rerum repellat quam. Eum aspernatur culpa sit saepe velit velit consequatur. Quia illo enim voluptas qui.` :
              'Discover the exceptional features and quality that make this product stand out from the rest.'
            }
          </p>
        </div>

        {/* Features Section */}
        <div className="supreme-quality-features">
          {features.map((feature, index) => (
            <div key={feature.id} className="supreme-quality-feature">
              <div className="feature-image-container">
                <img
                  src={feature.image ? `${IMAGE_PREFIX}${feature.image}` : null}
                  alt={feature.title}
                  className="feature-image"
                  onError={handleImageError}
                />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSupremeQuality;