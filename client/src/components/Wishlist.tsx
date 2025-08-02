
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import type { Product } from '../../../server/src/schema';

interface WishlistProps {
  isOpen: boolean;
  items: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onRemoveItem: (productId: number) => void;
}

export function Wishlist({
  isOpen,
  items,
  onClose,
  onAddToCart,
  onRemoveItem
}: WishlistProps) {
  const addAllToCart = () => {
    items.forEach((product: Product) => {
      if (product.stock_quantity > 0) {
        onAddToCart(product);
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 border-gray-800 text-white w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2 text-white">
            <Heart size={20} className="text-red-500" />
            <span>Wishlist ({items.length})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Heart size={64} className="text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-gray-400 mb-6">Save games you love for later!</p>
              <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
                Browse Games
              </Button>
            </div>
          ) : (
            <>
              {/* Add All to Cart Button */}
              <div className="mb-4">
                <Button
                  onClick={addAllToCart}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={items.every((item: Product) => item.stock_quantity === 0)}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Add All to Cart
                </Button>
              </div>

              {/* Wishlist Items */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {items.map((product: Product) => (
                  <Card key={product.id} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {/* Product Image */}
                        <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                              <span className="text-2xl">🎮</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-white text-sm line-clamp-2 pr-2">
                              {product.name}
                            </h4>
                            <button
                              onClick={() => onRemoveItem(product.id)}
                              className="p-1 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {product.short_description && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-1">
                              {product.short_description}
                            </p>
                          )}

                          <div className="flex items-center space-x-2 mb-2">
                            {product.platform && (
                              <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                                {product.platform}
                              </Badge>
                            )}
                            
                            {/* Rating */}
                            <div className="flex items-center space-x-1">
                              <Star size={12} className="text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-400">4.5</span>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">
                                ${product.price.toFixed(2)}
                              </span>
                              {product.original_price && product.original_price > product.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${product.original_price.toFixed(2)}
                                </span>
                              )}
                            </div>

                            <Button
                              onClick={() => onAddToCart(product)}
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-xs px-3 py-1"
                              disabled={product.stock_quantity === 0}
                            >
                              <ShoppingCart size={12} className="mr-1" />
                              {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                          </div>

                          {/* Stock Status */}
                          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                            <p className="text-xs text-yellow-400 mt-1">
                              Only {product.stock_quantity} left in stock!
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="border-t border-gray-800 pt-4 mt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-400 hover:text-white hover:border-purple-500"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
