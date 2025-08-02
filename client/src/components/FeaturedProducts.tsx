
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Star } from 'lucide-react';
import type { Product } from '../../../server/src/schema';

interface FeaturedProductsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

export function FeaturedProducts({
  products,
  onAddToCart,
  onAddToWishlist,
  isInWishlist
}: FeaturedProductsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  // Update visible count based on screen size
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1280) {
        setVisibleCount(3);
      } else {
        setVisibleCount(4);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (products.length <= visibleCount) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => 
        prev + visibleCount >= products.length ? 0 : prev + visibleCount
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [products.length, visibleCount]);

  const nextSlide = () => {
    setCurrentIndex(prev => 
      prev + visibleCount >= products.length ? 0 : prev + visibleCount
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prev =>
      prev === 0 ? Math.max(products.length - visibleCount, 0) : prev - visibleCount
    );
  };

  // Default products for development when no products are returned
  const defaultProducts: Product[] = products.length === 0 ? [
    {
      id: 1,
      name: 'Cyberpunk 2077: Phantom Liberty',
      slug: 'cyberpunk-2077-phantom-liberty',
      description: 'The highly anticipated expansion to Cyberpunk 2077',
      short_description: 'Action RPG expansion',
      price: 29.99,
      original_price: 39.99,
      category_id: 1,
      sku: 'CP2077-PL',
      stock_quantity: 100,
      digital_key: null,
      platform: 'PC, PlayStation, Xbox',
      region: 'Global',
      status: 'active' as const,
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: 'Baldur\'s Gate 3',
      slug: 'baldurs-gate-3',
      description: 'Epic fantasy RPG from Larian Studios',
      short_description: 'Turn-based RPG',
      price: 59.99,
      original_price: null,
      category_id: 1,
      sku: 'BG3',
      stock_quantity: 50,
      digital_key: null,
      platform: 'PC, PlayStation',
      region: 'Global',
      status: 'active' as const,
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: 'Spider-Man 2',
      slug: 'spider-man-2',
      description: 'Swing through New York as Spider-Man',
      short_description: 'Action Adventure',
      price: 69.99,
      original_price: null,
      category_id: 1,
      sku: 'SM2',
      stock_quantity: 75,
      digital_key: null,
      platform: 'PlayStation 5',
      region: 'Global',
      status: 'active' as const,
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      name: 'Starfield',
      slug: 'starfield',
      description: 'Explore the galaxy in this space RPG',
      short_description: 'Space RPG',
      price: 49.99,
      original_price: 69.99,
      category_id: 1,
      sku: 'SF',
      stock_quantity: 120,
      digital_key: null,
      platform: 'PC, Xbox',
      region: 'Global',
      status: 'active' as const,
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      name: 'Hogwarts Legacy',
      slug: 'hogwarts-legacy',
      description: 'Experience the magic of Hogwarts',
      short_description: 'Action RPG',
      price: 39.99,
      original_price: 59.99,
      category_id: 1,
      sku: 'HL',
      stock_quantity: 80,
      digital_key: null,
      platform: 'PC, PlayStation, Xbox, Switch',
      region: 'Global',
      status: 'active' as const,
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ] : products;

  const displayProducts = defaultProducts.slice(currentIndex, currentIndex + visibleCount);
  const showControls = defaultProducts.length > visibleCount;

  if (defaultProducts.length === 0) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
            Featured Games
          </h2>
          <div className="text-center text-gray-400">
            <p>No featured products available at the moment.</p>
            <p className="text-sm mt-2">Check back later for amazing deals!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Featured Games 🎮
          </h2>
          {showControls && (
            <div className="flex space-x-2">
              <Button
                onClick={prevSlide}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:text-white hover:border-purple-500"
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                onClick={nextSlide}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:text-white hover:border-purple-500"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product: Product) => (
              <Card
                key={product.id}
                className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 group hover:scale-105"
              >
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-700 rounded-t-lg overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                        <span className="text-6xl">🎮</span>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {product.original_price && product.original_price > product.price && (
                      <Badge className="absolute top-2 left-2 bg-red-600 text-white">
                        -{Math.round((1 - product.price / product.original_price) * 100)}%
                      </Badge>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => onAddToWishlist(product)}
                      className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                        isInWishlist(product.id)
                          ? 'bg-red-600 text-white'
                          : 'bg-black/40 text-gray-300 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {product.name}
                    </h3>
                    
                    {product.short_description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                        {product.short_description}
                      </p>
                    )}

                    {/* Platform */}
                    {product.platform && (
                      <div className="mb-3">
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {product.platform}
                        </Badge>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-white">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.original_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-400">4.5</span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      onClick={() => onAddToCart(product)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={product.stock_quantity === 0}
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {showControls && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(defaultProducts.length / visibleCount) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * visibleCount)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  Math.floor(currentIndex / visibleCount) === index
                    ? 'bg-purple-500 w-6'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
