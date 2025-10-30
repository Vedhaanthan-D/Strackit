import React from 'react';
import YouMayAlsoLike from './Home/components/sections/YouMayAlsoLike';

const YouMayAlsoLikeDemo = () => {
  const sampleProducts = [
    { 
      id: 1, 
      name: "Nira Voux", 
      price: 70.00, 
      originalPrice: 80.00, 
      image: "https://via.placeholder.com/140x100/f8f8f8/333?text=Nira+Voux" 
    },
    { 
      id: 2, 
      name: "Vixa M", 
      price: 60.00, 
      originalPrice: null, 
      image: "https://via.placeholder.com/140x100/f8f8f8/333?text=Vixa+M" 
    }
  ];

  const handleAddToCart = (productId) => {
    console.log('Adding product to cart:', productId);
    alert(`Product ${productId} added to cart!`);
  };

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f9fafb', 
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      {/* Simulating cart sidebar width */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        width: '400px', // Cart sidebar width
        maxWidth: '400px'
      }}>
        <YouMayAlsoLike 
          products={sampleProducts}
          total={60.00}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
};

export default YouMayAlsoLikeDemo;