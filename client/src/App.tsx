
import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeaturedProducts } from '@/components/FeaturedProducts';
import { Categories } from '@/components/Categories';
import { ProductSearch } from '@/components/ProductSearch';
import { Cart } from '@/components/Cart';
import { Wishlist } from '@/components/Wishlist';
import { AuthModal } from '@/components/AuthModal';
import { Footer } from '@/components/Footer';
import type { Product, Category } from '../../server/src/schema';

// Types for cart management
interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

interface WishlistState {
  items: Product[];
  isOpen: boolean;
}

// Type for logged in user (matches the login handler return type)
interface LoggedInUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

interface AppState {
  currentView: 'home' | 'products' | 'categories' | 'search';
  searchQuery: string;
  selectedCategory: number | null;
  user: LoggedInUser | null;
  cart: CartState;
  wishlist: WishlistState;
  authModal: {
    isOpen: boolean;
    mode: 'login' | 'register';
  };
}

function App() {
  const [state, setState] = useState<AppState>({
    currentView: 'home',
    searchQuery: '',
    selectedCategory: null,
    user: null,
    cart: { items: [], isOpen: false },
    wishlist: { items: [], isOpen: false },
    authModal: { isOpen: false, mode: 'login' }
  });

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gamava-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        setState(prev => ({
          ...prev,
          cart: { ...prev.cart, items: cartItems }
        }));
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('gamava-cart', JSON.stringify(state.cart.items));
  }, [state.cart.items]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [featuredResult, categoriesResult] = await Promise.all([
        trpc.getFeaturedProducts.query(12),
        trpc.getCategories.query()
      ]);
      
      setFeaturedProducts(featuredResult);
      setCategories(categoriesResult);
    } catch (error) {
      console.error('Failed to load initial data:', error);
      setFeaturedProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load wishlist when user changes
  const loadWishlist = useCallback(async () => {
    if (!state.user) return;
    
    try {
      await trpc.getWishlist.query({
        userId: state.user.id
      });
      
      // Note: Wishlist transformation will be implemented when backend returns proper data
      setState(prev => ({
        ...prev,
        wishlist: { ...prev.wishlist, items: [] }
      }));
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    }
  }, [state.user]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Search products
  const searchProducts = useCallback(async (query: string, categoryId?: number) => {
    try {
      const filters = {
        search: query || undefined,
        category_id: categoryId,
        limit: 50
      };
      
      const result = await trpc.getProducts.query(filters);
      setProducts(result);
    } catch (error) {
      console.error('Failed to search products:', error);
      setProducts([]);
    }
  }, []);

  // Cart management
  const addToCart = (product: Product, quantity: number = 1) => {
    setState(prev => {
      const existingItem = prev.cart.items.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return {
          ...prev,
          cart: {
            ...prev.cart,
            items: prev.cart.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          }
        };
      } else {
        return {
          ...prev,
          cart: {
            ...prev.cart,
            items: [...prev.cart.items, { product, quantity }]
          }
        };
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setState(prev => ({
      ...prev,
      cart: {
        ...prev.cart,
        items: prev.cart.items.filter(item => item.product.id !== productId)
      }
    }));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setState(prev => ({
      ...prev,
      cart: {
        ...prev.cart,
        items: prev.cart.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      }
    }));
  };

  // Wishlist management
  const addToWishlist = async (product: Product) => {
    if (!state.user) {
      setState(prev => ({
        ...prev,
        authModal: { isOpen: true, mode: 'login' }
      }));
      return;
    }

    try {
      await trpc.addToWishlist.mutate({
        user_id: state.user.id,
        product_id: product.id
      });
      
      setState(prev => ({
        ...prev,
        wishlist: {
          ...prev.wishlist,
          items: [...prev.wishlist.items, product]
        }
      }));
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      // Note: This would need the wishlist item ID in real implementation
      // For now, just remove from local state
      setState(prev => ({
        ...prev,
        wishlist: {
          ...prev.wishlist,
          items: prev.wishlist.items.filter(item => item.id !== productId)
        }
      }));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  // Navigation handlers
  const handleSearch = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query, currentView: 'search' }));
    searchProducts(query);
  };

  const handleCategorySelect = (categoryId: number) => {
    setState(prev => ({ 
      ...prev, 
      selectedCategory: categoryId, 
      currentView: 'categories' 
    }));
    searchProducts('', categoryId);
  };

  const handleViewChange = (view: AppState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }));
  };

  // Auth handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await trpc.loginUser.mutate({ email, password });
      if (response && response.user) {
        setState(prev => ({
          ...prev,
          user: response.user,
          authModal: { isOpen: false, mode: 'login' }
        }));
      } else {
        throw new Error('Login failed - no user returned');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    try {
      const user = await trpc.createUser.mutate(userData);
      // Convert full User to LoggedInUser format
      const loggedInUser: LoggedInUser = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: user.is_admin
      };
      
      setState(prev => ({
        ...prev,
        user: loggedInUser,
        authModal: { isOpen: false, mode: 'register' }
      }));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      user: null,
      wishlist: { items: [], isOpen: false }
    }));
  };

  // Toggle handlers
  const toggleCart = () => {
    setState(prev => ({
      ...prev,
      cart: { ...prev.cart, isOpen: !prev.cart.isOpen }
    }));
  };

  const toggleWishlist = () => {
    setState(prev => ({
      ...prev,
      wishlist: { ...prev.wishlist, isOpen: !prev.wishlist.isOpen }
    }));
  };

  const toggleAuthModal = (mode: 'login' | 'register') => {
    setState(prev => ({
      ...prev,
      authModal: { isOpen: !prev.authModal.isOpen, mode }
    }));
  };

  const cartItemCount = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = state.cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Gamava...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header
        user={state.user}
        cartItemCount={cartItemCount}
        wishlistItemCount={state.wishlist.items.length}
        onSearch={handleSearch}
        onCartToggle={toggleCart}
        onWishlistToggle={toggleWishlist}
        onLoginClick={() => toggleAuthModal('login')}
        onRegisterClick={() => toggleAuthModal('register')}
        onLogout={handleLogout}
        onViewChange={handleViewChange}
        currentView={state.currentView}
      />

      <main className="pt-16">
        {state.currentView === 'home' && (
          <>
            <Hero onExploreClick={() => handleViewChange('products')} />
            <FeaturedProducts
              products={featuredProducts}
              onAddToCart={addToCart}
              onAddToWishlist={addToWishlist}
              isInWishlist={(productId: number) => 
                state.wishlist.items.some(item => item.id === productId)
              }
            />
            <Categories
              categories={categories}
              onCategorySelect={handleCategorySelect}
            />
          </>
        )}

        {(state.currentView === 'search' || state.currentView === 'categories' || state.currentView === 'products') && (
          <ProductSearch
            products={products}
            categories={categories}
            searchQuery={state.searchQuery}
            selectedCategory={state.selectedCategory}
            onSearch={handleSearch}
            onCategorySelect={handleCategorySelect}
            onAddToCart={addToCart}
            onAddToWishlist={addToWishlist}
            isInWishlist={(productId: number) => 
              state.wishlist.items.some(item => item.id === productId)
            }
          />
        )}
      </main>

      <Footer />

      {/* Cart Sidebar */}
      <Cart
        isOpen={state.cart.isOpen}
        items={state.cart.items}
        total={cartTotal}
        onClose={toggleCart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        user={state.user}
      />

      {/* Wishlist Sidebar */}
      <Wishlist
        isOpen={state.wishlist.isOpen}
        items={state.wishlist.items}
        onClose={toggleWishlist}
        onAddToCart={addToCart}
        onRemoveItem={removeFromWishlist}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={state.authModal.isOpen}
        mode={state.authModal.mode}
        onClose={() => setState(prev => ({ ...prev, authModal: { ...prev.authModal, isOpen: false } }))}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onModeSwitch={(mode: 'login' | 'register') => 
          setState(prev => ({ ...prev, authModal: { ...prev.authModal, mode } }))
        }
      />
    </div>
  );
}

export default App;
