
import { z } from 'zod';

// Enums
export const orderStatusSchema = z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
export const productStatusSchema = z.enum(['active', 'inactive', 'out_of_stock']);

// Category schemas
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  parent_id: z.number().nullable(),
  image_url: z.string().nullable(),
  sort_order: z.number(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  parent_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

// Product schemas
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  short_description: z.string().nullable(),
  price: z.number(),
  original_price: z.number().nullable(),
  category_id: z.number(),
  sku: z.string().nullable(),
  stock_quantity: z.number(),
  digital_key: z.string().nullable(),
  platform: z.string().nullable(),
  region: z.string().nullable(),
  status: productStatusSchema,
  featured: z.boolean(),
  image_url: z.string().nullable(),
  gallery_urls: z.array(z.string()).nullable(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Product = z.infer<typeof productSchema>;

export const createProductInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  short_description: z.string().nullable().optional(),
  price: z.number().positive(),
  original_price: z.number().positive().nullable().optional(),
  category_id: z.number(),
  sku: z.string().nullable().optional(),
  stock_quantity: z.number().int().nonnegative().optional(),
  digital_key: z.string().nullable().optional(),
  platform: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  status: productStatusSchema.optional(),
  featured: z.boolean().optional(),
  image_url: z.string().nullable().optional(),
  gallery_urls: z.array(z.string()).nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// User schemas
export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  username: z.string().nullable(),
  avatar_url: z.string().nullable(),
  is_admin: z.boolean(),
  is_active: z.boolean(),
  last_login: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  username: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Order schemas
export const orderSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  order_number: z.string(),
  status: orderStatusSchema,
  total_amount: z.number(),
  currency: z.string(),
  billing_email: z.string(),
  billing_first_name: z.string(),
  billing_last_name: z.string(),
  payment_method: z.string().nullable(),
  payment_status: z.string(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type Order = z.infer<typeof orderSchema>;

export const orderItemSchema = z.object({
  id: z.number(),
  order_id: z.number(),
  product_id: z.number(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  digital_key: z.string().nullable(),
  created_at: z.coerce.date(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const createOrderInputSchema = z.object({
  user_id: z.number(),
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().int().positive(),
  })),
  billing_email: z.string().email(),
  billing_first_name: z.string().min(1),
  billing_last_name: z.string().min(1),
  payment_method: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

// Wishlist schemas
export const wishlistItemSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable(),
  session_id: z.string().nullable(),
  product_id: z.number(),
  created_at: z.coerce.date(),
});

export type WishlistItem = z.infer<typeof wishlistItemSchema>;

export const addToWishlistInputSchema = z.object({
  user_id: z.number().nullable().optional(),
  session_id: z.string().nullable().optional(),
  product_id: z.number(),
});

export type AddToWishlistInput = z.infer<typeof addToWishlistInputSchema>;

// Search and filter schemas
export const productFiltersSchema = z.object({
  category_id: z.number().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  platform: z.string().optional(),
  region: z.string().optional(),
  featured: z.boolean().optional(),
  status: productStatusSchema.optional(),
  search: z.string().optional(),
  sort_by: z.enum(['name', 'price', 'created_at', 'featured']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().positive().max(100).optional(),
  offset: z.number().int().nonnegative().optional(),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;
