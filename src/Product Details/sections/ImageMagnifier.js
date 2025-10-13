import React, { useState, useRef } from 'react';
import './ImageMagnifier.css';

const ImageMagnifier = ({ 
  src, 
  alt, 
  zoomLevel = 2.5, 
  lensSize = 120,
  className = '',
  onError 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate lens position (centered on cursor)
    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;

    // Constrain lens within image boundaries
    const constrainedLensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
    const constrainedLensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

    // Calculate zoom position as percentage
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setLensPosition({ x: constrainedLensX, y: constrainedLensY });
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    e.preventDefault();
    setIsHovering(true);
    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;
    const constrainedLensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
    const constrainedLensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setLensPosition({ x: constrainedLensX, y: constrainedLensY });
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isHovering) return;

    const touch = e.touches[0];
    const rect = imageRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const lensX = x - lensSize / 2;
    const lensY = y - lensSize / 2;
    const constrainedLensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
    const constrainedLensY = Math.max(0, Math.min(lensY, rect.height - lensSize));

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setLensPosition({ x: constrainedLensX, y: constrainedLensY });
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const handleTouchEnd = () => {
    setIsHovering(false);
  };

  return (
    <div className={`image-magnifier ${className}`}>
      <div
        className="image-magnifier-container"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="magnifier-image"
          onError={onError}
          draggable={false}
        />

        {/* Magnifying Lens */}
        {isHovering && (
          <div
            className="magnifier-lens"
            style={{
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
              width: `${lensSize}px`,
              height: `${lensSize}px`,
            }}
          />
        )}

        {/* Zoom Result Window */}
        {isHovering && (
          <div className="magnifier-zoom-window">
            <img
              src={src}
              alt={`${alt} zoomed`}
              className="magnifier-zoom-image"
              style={{
                transform: `translate(-${zoomPosition.x}%, -${zoomPosition.y}%) scale(${zoomLevel})`,
                transformOrigin: 'top left',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageMagnifier;