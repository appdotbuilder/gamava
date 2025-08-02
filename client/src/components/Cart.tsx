
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import type { Product } from '../../../server/src/schema';

interface CartItem {
  product: Product;
  quantity: number;
}

// Local interface for the logged-in user (matches login handler return type)
interface LoggedInUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  user: LoggedInUser | null;
  onClose: () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

export function Cart({
  isOpen,
  items,
  total,
  user,
  onClose,
  onUpdateQuantity,
  onRemoveItem
}: CartProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = total;
  const tax = total * 0.1; // 10% tax
  const finalTotal = subtotal + tax;

  const handleCheckout = async () => {
    if (!user) {
      alert('Please log in to checkout');
      return;
    }

    // This would integrate with the order creation API
    try {
      const orderData = {
        user_id: user.id,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        billing_email: user.email,
        billing_first_name: user.first_name,
        billing_last_name: user.last_name,
        payment_method: 'card',
        notes: null
      };

      // Note: This would call trpc.createOrder.mutate(orderData) in real implementation
      console.log('Would create order:', orderData);
      alert('Order functionality will be available soon!');
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-gray-900 border-gray-800 text-white w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2 text-white">
            <ShoppingBag size={20} />
            <span>Shopping Cart ({itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full mt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-400 mb-6">Add some awesome games to get started!</p>
              <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {items.map((item: CartItem) => (
                  <Card key={item.product.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.image_url ? (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                              <span className="text-xl">🎮</span>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                            {item.product.name}
                          </h4>
                          
                          {item.product.platform && (
                            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300 mb-2">
                              {item.product.platform}
                            </Badge>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-md bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  const newQuantity = parseInt(e.target.value) || 1;
                                  onUpdateQuantity(item.product.id, newQuantity);
                                }}
                                className="w-16 h-8 text-center bg-gray-700 border-gray-600 text-white text-sm"
                                min="1"
                                max={item.product.stock_quantity}
                              />
                              
                              <button
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-md bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                                disabled={item.quantity >= item.product.stock_quantity}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.product.id)}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-medium text-white">
                              ${item.product.price.toFixed(2)} each
                            </span>
                            <span className="text-sm font-bold text-purple-400">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t border-gray-800 pt-4 mt-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal ({itemCount} items)</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax (10%)</span>
                      <span className="text-white">${tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Total</span>
                        <span className="text-purple-400 text-lg">${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {!user && (
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3 mt-4">
                        <p className="text-yellow-400 text-sm">
                          Please log in to proceed with checkout
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                      disabled={!user}
                    >
                      <CreditCard size={16} className="mr-2" />
                      Proceed to Checkout
                    </Button>

                    <Button
                      onClick={onClose}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-400 hover:text-white hover:border-purple-500"
                    >
                      Continue Shopping
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
