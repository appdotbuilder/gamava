
import { serial, text, pgTable, timestamp, numeric, integer, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'out_of_stock']);

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parent_id: integer('parent_id'),
  image_url: text('image_url'),
  sort_order: integer('sort_order').default(0).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Products table
export const productsTable = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  short_description: text('short_description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  original_price: numeric('original_price', { precision: 10, scale: 2 }),
  category_id: integer('category_id').notNull(),
  sku: text('sku').unique(),
  stock_quantity: integer('stock_quantity').default(0).notNull(),
  digital_key: text('digital_key'),
  platform: text('platform'),
  region: text('region'),
  status: productStatusEnum('status').default('active').notNull(),
  featured: boolean('featured').default(false).notNull(),
  image_url: text('image_url'),
  gallery_urls: text('gallery_urls').array(),
  meta_title: text('meta_title'),
  meta_description: text('meta_description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  username: text('username').unique(),
  avatar_url: text('avatar_url'),
  is_admin: boolean('is_admin').default(false).notNull(),
  is_active: boolean('is_active').default(true).notNull(),
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table
export const ordersTable = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  order_number: text('order_number').notNull().unique(),
  status: orderStatusEnum('status').default('pending').notNull(),
  total_amount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  billing_email: text('billing_email').notNull(),
  billing_first_name: text('billing_first_name').notNull(),
  billing_last_name: text('billing_last_name').notNull(),
  payment_method: text('payment_method'),
  payment_status: text('payment_status').default('pending').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Order items table
export const orderItemsTable = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id').notNull(),
  product_id: integer('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  total_price: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  digital_key: text('digital_key'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Wishlist table
export const wishlistTable = pgTable('wishlist', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id'),
  session_id: text('session_id'),
  product_id: integer('product_id').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categoriesTable, ({ many, one }) => ({
  products: many(productsTable),
  parent: one(categoriesTable, {
    fields: [categoriesTable.parent_id],
    references: [categoriesTable.id],
  }),
  children: many(categoriesTable),
}));

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, {
    fields: [productsTable.category_id],
    references: [categoriesTable.id],
  }),
  orderItems: many(orderItemsTable),
  wishlistItems: many(wishlistTable),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  orders: many(ordersTable),
  wishlistItems: many(wishlistTable),
}));

export const ordersRelations = relations(ordersTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [ordersTable.user_id],
    references: [usersTable.id],
  }),
  items: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const wishlistRelations = relations(wishlistTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [wishlistTable.user_id],
    references: [usersTable.id],
  }),
  product: one(productsTable, {
    fields: [wishlistTable.product_id],
    references: [productsTable.id],
  }),
}));

// Export all tables for relation queries
export const tables = {
  categories: categoriesTable,
  products: productsTable,
  users: usersTable,
  orders: ordersTable,
  orderItems: orderItemsTable,
  wishlist: wishlistTable,
};
