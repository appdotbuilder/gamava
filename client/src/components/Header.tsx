
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  Menu, 
  Home,
  Grid3X3,
  LogOut
} from 'lucide-react';

// Local interface for the logged-in user (matches login handler return type)
interface LoggedInUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_admin: boolean;
}

interface HeaderProps {
  user: LoggedInUser | null;
  cartItemCount: number;
  wishlistItemCount: number;
  currentView: 'home' | 'products' | 'categories' | 'search';
  onSearch: (query: string) => void;
  onCartToggle: () => void;
  onWishlistToggle: () => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
  onViewChange: (view: 'home' | 'products' | 'categories' | 'search') => void;
}

export function Header({
  user,
  cartItemCount,
  wishlistItemCount,
  currentView,
  onSearch,
  onCartToggle,
  onWishlistToggle,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onViewChange
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'products', label: 'Products', icon: Grid3X3 },
    { id: 'categories', label: 'Categories', icon: Menu },
  ] as const;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onViewChange('home')}
              className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent hover:from-purple-400 hover:to-pink-400 transition-all duration-200"
            >
              🎮 Gamava
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-purple-600/20 text-purple-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search games, software..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
              Search
            </Button>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            {/* Wishlist */}
            <button
              onClick={onWishlistToggle}
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Heart size={20} />
              {wishlistItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white">
                  {wishlistItemCount}
                </Badge>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={onCartToggle}
              className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-purple-600 text-white">
                  {cartItemCount}
                </Badge>
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg">
                  <User size={16} />
                  <span className="text-sm text-gray-300">
                    {user.first_name} {user.last_name}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  onClick={onLoginClick}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  Login
                </Button>
                <Button
                  onClick={onRegisterClick}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-800 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
              <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
                Search
              </Button>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      currentView === item.id
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Auth */}
            {!user && (
              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-800">
                <Button
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="ghost"
                  className="flex-1 text-gray-400 hover:text-white"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    onRegisterClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
