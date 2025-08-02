
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createCategoryInputSchema,
  createProductInputSchema,
  productFiltersSchema,
  createUserInputSchema,
  loginInputSchema,
  createOrderInputSchema,
  addToWishlistInputSchema,
} from './schema';

// Import handlers
import { createCategory } from './handlers/create_category';
import { getCategories } from './handlers/get_categories';
import { createProduct } from './handlers/create_product';
import { getProducts } from './handlers/get_products';
import { getProductBySlug } from './handlers/get_product_by_slug';
import { getFeaturedProducts } from './handlers/get_featured_products';
import { createUser } from './handlers/create_user';
import { loginUser } from './handlers/login_user';
import { createOrder } from './handlers/create_order';
import { getUserOrders } from './handlers/get_user_orders';
import { addToWishlist } from './handlers/add_to_wishlist';
import { getWishlist } from './handlers/get_wishlist';
import { removeFromWishlist } from './handlers/remove_from_wishlist';
import { z } from 'zod';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Category routes
  createCategory: publicProcedure
    .input(createCategoryInputSchema)
    .mutation(({ input }) => createCategory(input)),
  
  getCategories: publicProcedure
    .query(() => getCategories()),

  // Product routes
  createProduct: publicProcedure
    .input(createProductInputSchema)
    .mutation(({ input }) => createProduct(input)),
  
  getProducts: publicProcedure
    .input(productFiltersSchema.optional())
    .query(({ input }) => getProducts(input)),
  
  getProductBySlug: publicProcedure
    .input(z.string())
    .query(({ input }) => getProductBySlug(input)),
  
  getFeaturedProducts: publicProcedure
    .input(z.number().int().positive().max(50).optional())
    .query(({ input }) => getFeaturedProducts(input)),

  // User routes
  createUser: publicProcedure
    .input(createUserInputSchema)
    .mutation(({ input }) => createUser(input)),
  
  loginUser: publicProcedure
    .input(loginInputSchema)
    .mutation(({ input }) => loginUser(input)),

  // Order routes
  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(({ input }) => createOrder(input)),
  
  getUserOrders: publicProcedure
    .input(z.number())
    .query(({ input }) => getUserOrders(input)),

  // Wishlist routes
  addToWishlist: publicProcedure
    .input(addToWishlistInputSchema)
    .mutation(({ input }) => addToWishlist(input)),
  
  getWishlist: publicProcedure
    .input(z.object({
      userId: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .query(({ input }) => getWishlist(input.userId, input.sessionId)),
  
  removeFromWishlist: publicProcedure
    .input(z.number())
    .mutation(({ input }) => removeFromWishlist(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
