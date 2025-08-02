
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Star, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  X
} from 'lucide-react';
import type { Product, Category } from '../../../server/src/schema';

interface ProductSearchProps {
  products: Product[];
  categories: Category[];
  searchQuery: string;
  selectedCategory: number | null;
  onSearch: (query: string) => void;
  onCategorySelect: (categoryId: number) => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

interface FilterState {
  minPrice: number;
  maxPrice: number;
  platform: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
}

export function ProductSearch({
  products,
  searchQuery,
  selectedCategory,
  onSearch,
  onCategorySelect,
  onAddToCart,
  onAddToWishlist,
  isInWishlist
}: ProductSearchProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: 0,
    maxPrice: 100,
    platform: 'all',
    sortBy: 'name',
    viewMode: 'grid'
  });

  // Default products for development when no products are returned
  const defaultProducts: Product[] = products.length === 0 ? [
    {
      id: 1,
      name: 'The Witcher 3: Wild Hunt',
      slug: 'witcher-3-wild-hunt',
      description: 'Epic fantasy RPG with rich storytelling and vast open world',
      short_description: 'Open World RPG',
      price: 19.99,
      original_price: 39.99,
      category_id: 1,
      sku: 'W3WH',
      stock_quantity: 150,
      digital_key: null,
      platform: 'PC, PlayStation, Xbox, Switch',
      region: 'Global',
      status: 'active' as const,
      featured: true,
      image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: 'Red Dead Redemption 2',
      slug: 'red-dead-redemption-2',
      description: 'Western action-adventure game set in 1899',
      short_description: 'Western Adventure',
      price: 29.99,
      original_price: null,
      category_id: 1,
      sku: 'RDR2',
      stock_quantity: 85,
      digital_key: null,
      platform: 'PC, PlayStation, Xbox',
      region: 'Global',
      status: 'active' as const,
      featured: false,
      image_url: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: 'Assassin\'s Creed Valhalla',
      slug: 'assassins-creed-valhalla',
      description: 'Viking saga in medieval England',
      short_description: 'Action Adventure',
      price: 24.99,
      original_price: 59.99,
      category_id: 1,
      sku: 'ACV',
      stock_quantity: 200,
      digital_key: null,
      platform: 'PC, PlayStation, Xbox',
      region: 'Global',
      status: 'active' as const,
      featured: false,
      image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop',
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ] : products;

  // Filter products based on current filters
  const filteredProducts = defaultProducts.filter((product: Product) => {
    // Price filter
    if (product.price < filters.minPrice || product.price > filters.maxPrice) {
      return false;
    }
    
    // Platform filter
    if (filters.platform !== 'all' && product.platform && 
        !product.platform.toLowerCase().includes(filters.platform.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (selectedCategory && product.category_id !== selectedCategory) {
      return false;
    }
    
    // Search query filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a: Product, b: Product) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearchQuery);
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 100,
      platform: 'all',
      sortBy: 'name',
      viewMode: filters.viewMode
    });
    onCategorySelect(0);
    onSearch('');
    setLocalSearchQuery('');
  };

  const platforms = ['PC', 'PlayStation', 'Xbox', 'Switch', 'Mobile'];

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             selectedCategory ? 'Category Products' : 'All Products'}
          </h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search for games, software..."
                value={localSearchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
              />
            </div>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600 text-gray-400 hover:text-white hover:border-purple-500"
            >
              <SlidersHorizontal size={20} className="mr-2" />
              Filters
            </Button>
          </form>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <div className="flex items-center gap-2">
                  <Button onClick={clearFilters} variant="ghost" size="sm" className="text-gray-400">
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setShowFilters(false)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Price Range: ${filters.minPrice} - ${filters.maxPrice}
                  </label>
                  <div className="space-y-3">
                    <Slider
                      value={[filters.minPrice]}
                      onValueChange={(value: number[]) => handleFilterChange('minPrice', value[0])}
                      max={filters.maxPrice}
                      step={1}
                      className="w-full"
                    />
                    <Slider
                      value={[filters.maxPrice]}
                      onValueChange={(value: number[]) => handleFilterChange('maxPrice', value[0])}
                      min={filters.minPrice}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Platform Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Platform</label>
                  <Select value={filters.platform || 'all'} onValueChange={(value: string) => handleFilterChange('platform', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">All Platforms</SelectItem>
                      {platforms.map((platform: string) => (
                        <SelectItem key={platform} value={platform.toLowerCase()}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Sort By</label>
                  <Select value={filters.sortBy || 'name'} onValueChange={(value: string) => handleFilterChange('sortBy', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">View</label>
                  <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => handleFilterChange('viewMode', 'grid')}
                      className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md transition-colors ${
                        filters.viewMode === 'grid'
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => handleFilterChange('viewMode', 'list')}
                      className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md transition-colors ${
                        filters.viewMode === 'list'
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-400">
            Showing {sortedProducts.length} of {defaultProducts.length} products
          </p>
          
          {/* Active Filters */}
          <div className="flex items-center gap-2">
            {(searchQuery || selectedCategory || filters.platform !== 'all') && (
              <div className="flex items-center gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                    Search: {searchQuery}
                    <button
                      onClick={() => onSearch('')}
                      className="ml-1 hover:text-purple-300"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                )}
                {filters.platform !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                    {filters.platform}
                    <button
                      onClick={() => handleFilterChange('platform', 'all')}
                      className="ml-1 hover:text-blue-300"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products Grid/List */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search criteria or browse our categories
            </p>
            <Button onClick={clearFilters} className="bg-purple-600 hover:bg-purple-700">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={
            filters.viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {sortedProducts.map((product: Product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={filters.viewMode}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                isInWishlist={isInWishlist(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isInWishlist: boolean;
}

function ProductCard({ product, viewMode, onAddToCart, onAddToWishlist, isInWishlist }: ProductCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex">
            {/* Product Image */}
            <div className="w-48 h-32 bg-gray-700 flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                  <span className="text-3xl">🎮</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 p-4 flex justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-2 text-lg">{product.name}</h3>
                {product.description && (
                  <p className="text-gray-400 mb-3 text-sm line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {product.platform && (
                    <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                      {product.platform}
                    </Badge>
                  )}
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-400">4.5</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between ml-4">
                <div className="text-right mb-3">
                  <div className="text-xl font-bold text-white">${product.price.toFixed(2)}</div>
                  {product.original_price && product.original_price > product.price && (
                    <div className="text-sm text-gray-400 line-through">
                      ${product.original_price.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddToWishlist(product)}
                    className={`p-2 rounded-lg transition-colors ${
                      isInWishlist
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
                  </button>
                  <Button
                    onClick={() => onAddToCart(product)}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (same as FeaturedProducts card)
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 group hover:scale-105">
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
              isInWishlist
                ? 'bg-red-600 text-white'
                : 'bg-black/40 text-gray-300 hover:bg-red-600 hover:text-white'
            }`}
          >
            <Heart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
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
  );
}
