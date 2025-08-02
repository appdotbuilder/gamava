
import { Card, CardContent } from '@/components/ui/card';
import { 
  Gamepad2, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Mouse,
  Cpu
} from 'lucide-react';
import type { Category } from '../../../server/src/schema';

interface CategoriesProps {
  categories: Category[];
  onCategorySelect: (categoryId: number) => void;
}

export function Categories({ categories, onCategorySelect }: CategoriesProps) {
  // Default categories for when backend returns empty data
  const defaultCategories: Category[] = categories.length === 0 ? [
    {
      id: 1,
      name: 'PC Games',
      slug: 'pc-games',
      description: 'Latest PC games and classics',
      parent_id: null,
      image_url: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: 'Console Games',
      slug: 'console-games',
      description: 'PlayStation, Xbox, Nintendo games',
      parent_id: null,
      image_url: null,
      sort_order: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: 'Mobile Games',
      slug: 'mobile-games',
      description: 'Games for iOS and Android',
      parent_id: null,
      image_url: null,
      sort_order: 3,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      name: 'Gaming Hardware',
      slug: 'gaming-hardware',
      description: 'Controllers, headsets, keyboards',
      parent_id: null,
      image_url: null,
      sort_order: 4,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 5,
      name: 'Software',
      slug: 'software',
      description: 'Productivity and creative software',
      parent_id: null,
      image_url: null,
      sort_order: 5,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 6,
      name: 'Gaming Accessories',
      slug: 'gaming-accessories',
      description: 'Mice, keyboards, and more',
      parent_id: null,
      image_url: null,
      sort_order: 6,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    }
  ] : categories;

  // Icon mapping for categories
  const getCategoryIcon = (slug: string): React.ComponentType<{ size: number; className?: string }> => {
    const iconMap: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
      'pc-games': Gamepad2,
      'console-games': Monitor,
      'mobile-games': Smartphone,
      'gaming-hardware': Headphones,
      'software': Cpu,
      'gaming-accessories': Mouse,
    };
    
    return iconMap[slug] || Gamepad2;
  };

  // Color schemes for categories
  const getCategoryColors = (index: number) => {
    const colorSchemes = [
      'from-purple-600 to-pink-600',
      'from-blue-600 to-cyan-600',
      'from-green-600 to-teal-600',
      'from-orange-600 to-red-600',
      'from-indigo-600 to-purple-600',
      'from-pink-600 to-rose-600',
    ];
    
    return colorSchemes[index % colorSchemes.length];
  };

  if (defaultCategories.length === 0) {
    return (
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-white">
            Shop by Category
          </h2>
          <div className="text-center text-gray-400">
            <p>Categories are being loaded...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-white">
          Shop by Category 🛍️
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {defaultCategories.map((category: Category, index: number) => {
            const Icon = getCategoryIcon(category.slug);
            const colorScheme = getCategoryColors(index);
            
            return (
              <Card
                key={category.id}
                className="bg-gray-900 border-gray-700 hover:border-purple-500 transition-all duration-300 group cursor-pointer hover:scale-105"
                onClick={() => onCategorySelect(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${colorScheme} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={28} className="text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          {category.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-gray-400 group-hover:text-purple-400 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* View All Categories Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => onCategorySelect(0)} // 0 could mean "all categories"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
          >
            View All Categories →
          </button>
        </div>
      </div>
    </section>
  );
}
