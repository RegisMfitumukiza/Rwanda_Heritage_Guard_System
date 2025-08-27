import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder = null,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  onLoad = () => { },
  onError = () => { },
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  const handleError = () => {
    setHasError(true);
    onError();
  };

  const defaultPlaceholder = (
    <div className={cn(
      'bg-gray-200 animate-pulse flex items-center justify-center',
      className
    )}>
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  );

  const errorPlaceholder = (
    <div className={cn(
      'bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300',
      className
    )}>
      <div className="text-gray-400 text-sm text-center p-4">
        <div className="mb-2">⚠️</div>
        <div>Image not available</div>
      </div>
    </div>
  );

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {!isInView && (placeholder || defaultPlaceholder)}

      {isInView && !hasError && (
        <>
          {!isLoaded && (placeholder || defaultPlaceholder)}
          <img
            src={src}
            alt={alt}
            loading={loading}
            decoding={decoding}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0',
              className
            )}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </>
      )}

      {hasError && errorPlaceholder}
    </div>
  );
};

export { LazyImage };