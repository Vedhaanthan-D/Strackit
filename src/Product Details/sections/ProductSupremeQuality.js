import React, { useState, useEffect } from 'react';
import { fetchProducts } from 'shops-query/src/modules/products/queries/get.js';
import { getProductsController } from 'shops-query/src/modules/products/index.js';
import { IMAGE_PREFIX, HOME_CONFIG } from '../../config/appIds.js';
import { getSupremeQualityImageConfig } from './productDetailsConfig.js';
import '../styles/ProductSupremeQuality.css';

const ProductSupremeQuality = ({ product, productId }) => {
  const [productData, setProductData] = useState(null);
  const [thirdProductImage, setThirdProductImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageConfig, setImageConfig] = useState(null);
 
  // Set CSS variables for Supreme Quality images dynamically
  useEffect(() => {
    const config = getSupremeQualityImageConfig();
    setImageConfig(config);
    const root = document.documentElement;
    
    root.style.setProperty('--supreme-quality-image-width', `${config.width}px`);
    root.style.setProperty('--supreme-quality-image-height', `${config.height}px`);
    root.style.setProperty('--supreme-quality-image-object-fit', config.objectFit);
    root.style.setProperty('--supreme-quality-image-bg-color', config.backgroundColor);
  }, []);

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

        // Fetch a different product for the third image
        try {
          const productsResponse = await getProductsController({
            shopId: HOME_CONFIG?.shopId,
            page: 1,
            limit: 10
          });

          if (productsResponse?.data?.products && productsResponse.data.products.length > 0) {
            // Find a different product (not the current one)
            const differentProduct = productsResponse.data.products.find(
              p => p.id !== productId && p.id !== product?.id
            ) || productsResponse.data.products[0];

            // Get the first image from the different product
            if (differentProduct?.productImage?.[0]?.image) {
              setThirdProductImage(differentProduct.productImage[0].image);
            } else if (differentProduct?.featureImage) {
              setThirdProductImage(differentProduct.featureImage);
            }
          }
        } catch (err) {
          // console.warn('Failed to fetch third product image:', err);
          // Continue without third product image
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

    // Check if product is WOMENS T-SHIRTS
    const isWomensTShirts = (product) => {
      if (!product) return false;
      const productName = (product.name || product.title || '').toLowerCase();
      return productName.includes('womens t-shirts') || 
             productName.includes('women t-shirts') ||
             productName.includes('womens t-shirt');
    };

    // Get unique images from the product
    const getUniqueProductImages = () => {
      const uniqueImages = [];
      const seenImages = new Set();

      // Special handling for WOMENS T-SHIRTS to ensure correct order: black full-body, white, black close-up
      if (isWomensTShirts(data)) {
        // console.log('WOMENS T-SHIRTS - Product data:', {
        //   productImageCount: data.productImage?.length,
        //   productImages: data.productImage?.map((img, idx) => `[${idx}]: ${img.image}`),
        //   featureImage: data.featureImage,
        //   thirdProductImage: thirdProductImage
        // });

        // Strategy: Get black full-body, white, then black close-up (or any remaining image)
        
        // 1. First image: Black full-body from productImage[0]
        if (data.productImage?.[0]?.image && !seenImages.has(data.productImage[0].image)) {
          uniqueImages.push(data.productImage[0].image);
          seenImages.add(data.productImage[0].image);
          // console.log('Added image 1 (black full-body):', data.productImage[0].image);
        }
        
        // 2. Second image: White t-shirt from featureImage
        if (data.featureImage && !seenImages.has(data.featureImage)) {
          uniqueImages.push(data.featureImage);
          seenImages.add(data.featureImage);
          // console.log('Added image 2 (white from featureImage):', data.featureImage);
        }
        
        // 3. Third image: Try to get black close-up or any other unique image
        // Check productImage[2] first (likely the close-up), then [1], then others
        const remainingIndices = [2, 1, 3, 4, 5, 6, 7, 8, 9]; // Prioritize index 2
        for (const idx of remainingIndices) {
          if (uniqueImages.length >= 3) break;
          if (data.productImage?.[idx]?.image && !seenImages.has(data.productImage[idx].image)) {
            uniqueImages.push(data.productImage[idx].image);
            seenImages.add(data.productImage[idx].image);
            // console.log(`Added image 3 from productImage[${idx}]:`, data.productImage[idx].image);
            break;
          }
        }
        
        // Fallback: Use thirdProductImage if still don't have 3 images
        if (uniqueImages.length < 3 && thirdProductImage && !seenImages.has(thirdProductImage)) {
          uniqueImages.push(thirdProductImage);
          seenImages.add(thirdProductImage);
          // console.log('Added image 3 (fallback from thirdProductImage):', thirdProductImage);
        }
        
        // console.log('WOMENS T-SHIRTS Final images:', {
        //   count: uniqueImages.length,
        //   images: uniqueImages
        // });
      } else {
        // Default behavior for other products
        // First, try to get images from productImage array
        if (data.productImage && Array.isArray(data.productImage)) {
          for (const img of data.productImage) {
            if (img.image && !seenImages.has(img.image)) {
              uniqueImages.push(img.image);
              seenImages.add(img.image);
              if (uniqueImages.length >= 3) break;
            }
          }
        }

        // If we don't have 3 unique images yet, try featureImage
        if (uniqueImages.length < 3 && data.featureImage && !seenImages.has(data.featureImage)) {
          uniqueImages.push(data.featureImage);
          seenImages.add(data.featureImage);
        }

        // If we still don't have 3 images and have thirdProductImage from another product
        if (uniqueImages.length < 3 && thirdProductImage && !seenImages.has(thirdProductImage)) {
          uniqueImages.push(thirdProductImage);
          seenImages.add(thirdProductImage);
        }
      }

      // Only return the unique images we actually have - don't fill with duplicates
      return uniqueImages.slice(0, 3);
    };

    const uniqueImages = getUniqueProductImages();
    const features = [];

    // Get full description for Information Product section
    const getFullDescription = () => {
      // Priority order for getting the full detailed description:
      // 1. otherInformation field (typically contains detailed product info)
      // 2. fullDescription field
      // 3. longDescription field
      // 4. detailedDescription field
      // 5. Fallback to comprehensive description
      
      if (data.otherInformation && stripHtmlTags(data.otherInformation).length > 100) {
        return stripHtmlTags(data.otherInformation);
      }
      if (data.fullDescription && stripHtmlTags(data.fullDescription).length > 100) {
        return stripHtmlTags(data.fullDescription);
      }
      if (data.longDescription && stripHtmlTags(data.longDescription).length > 100) {
        return stripHtmlTags(data.longDescription);
      }
      if (data.detailedDescription && stripHtmlTags(data.detailedDescription).length > 100) {
        return stripHtmlTags(data.detailedDescription);
      }
      
      // Always return the comprehensive detailed description as default
      return 'This women\'s black solid crew neck t-shirt is a versatile and essential piece for any wardrobe. Crafted from a soft and comfortable fabric, it offers a classic and timeless look that can be dressed up or down for any occasion. The simple crew neck design provides a flattering and effortless fit, while the short sleeves offer freedom of movement and breathability. The solid black color makes it incredibly easy to pair with anything in your closet, from jeans and sneakers for a casual weekend look to skirts and heels for a more polished ensemble. It\'s perfect for layering under jackets, cardigans, or blazers, adding a touch of understated style to any outfit. Made with durability in mind, this t-shirt is designed to withstand everyday wear and washing, retaining its shape and color for long-lasting enjoyment. Whether you\'re running errands, heading to work, or simply relaxing at home, this black crew neck t-shirt is a reliable and stylish choice that you\'ll reach for time and time again. Available in a range of sizes to ensure the perfect fit, it\'s a wardrobe staple that offers endless possibilities.';
    };

    // Feature 1: Information Product - Use full detailed description
    features.push({
      id: 1,
      title: 'Information Product',
      description: getFullDescription(),
      image: uniqueImages[0] || null,
      type: 'description'
    });

    // Feature 2: Fabricae Material (from specification) - Use second unique image
    if (data.specification) {
      features.push({
        id: 2,
        title: 'Fabricae Material',
        description: stripHtmlTags(data.specification).substring(0, 200) + '...',
        image: uniqueImages[1] || null,
        type: 'specification'
      });
    }

    // Feature 3: Instructions - Use third unique image
    if (data.howToUse || data.otherInformation) {
      features.push({
        id: 3,
        title: 'Instructions',
        description: stripHtmlTags(data.howToUse || data.otherInformation),
        image: uniqueImages[2] || null,
        type: 'instructions'
      });
    }

    // Fill with default features if we don't have enough
    while (features.length < 3) {
      const featureIndex = features.length;
      features.push({
        id: features.length + 1,
        title: getDefaultFeatureTitle(featureIndex),
        description: getDefaultFeatureDescription(featureIndex),
        image: uniqueImages[featureIndex] || null,
        type: 'default'
      });
    }

    return features.slice(0, 3); // Always return exactly 3 features
  };

  // Strip HTML tags and unwanted symbols from text
  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '')
               .replace(/&[^;]+;/g, ' ')
               .replace(/[*#]/g, '')  // Remove * and # symbols
               .trim();
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
            {[1,2,3].map(i => (
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
            {productData?.description ? 
              stripHtmlTags(productData.description) :
              'Classic black tee. Soft, comfortable, and versatile. Perfect for everyday wear. Crew neck.'
            }
          </p>
        </div>

        {/* Features Section */}
        <div className="supreme-quality-features">
          {features.filter(item => item.image).map((feature, index) => (
            <div key={feature.id} className="supreme-quality-feature">
              <div className="feature-image-container">
                <img
                  src={feature.image ? `${IMAGE_PREFIX}${feature.image}` : null}
                  alt={feature.title}
                  className="feature-image"
                  onError={handleImageError}
                />
                {imageConfig?.showDimensions && (
                  <div className="image-dimensions-label">
                    {imageConfig.width} × {imageConfig.height}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Information Product Section - Below all images */}
        {features[0] && (
          <div className="information-product-section">
            <h3 className="information-product-title">{features[0].title}</h3>
            <p className="information-product-description">{features[0].description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSupremeQuality;