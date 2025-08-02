
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { categoriesTable, productsTable } from '../db/schema';
import { type ProductFilters } from '../schema';
import { getProducts } from '../handlers/get_products';

// Test data
const testCategory = {
  name: 'Gaming',
  slug: 'gaming',
  description: 'Gaming products',
  parent_id: null,
  image_url: null,
  sort_order: 1,
  is_active: true,
};

describe('getProducts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  beforeEach(async () => {
    // Create test category
    await db.insert(categoriesTable).values(testCategory).execute();

    // Create test products individually to ensure different timestamps
    await db.insert(productsTable).values({
      name: 'Game A',
      slug: 'game-a',
      description: 'An awesome game',
      short_description: 'Awesome game',
      price: '29.99',
      original_price: '39.99',
      category_id: 1,
      sku: 'GAME-A-001',
      stock_quantity: 100,
      digital_key: null,
      platform: 'PC',
      region: 'US',
      status: 'active' as const,
      featured: true,
      image_url: 'game-a.jpg',
      gallery_urls: null,
      meta_title: 'Game A',
      meta_description: 'Game A description',
    }).execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(productsTable).values({
      name: 'Game B',
      slug: 'game-b',
      description: 'Another great game',
      short_description: 'Great game',
      price: '19.99',
      original_price: null,
      category_id: 1,
      sku: 'GAME-B-001',
      stock_quantity: 50,
      digital_key: null,
      platform: 'PlayStation',
      region: 'EU',
      status: 'active' as const,
      featured: false,
      image_url: 'game-b.jpg',
      gallery_urls: null,
      meta_title: 'Game B',
      meta_description: 'Game B description',
    }).execute();

    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(productsTable).values({
      name: 'Game C',
      slug: 'game-c',
      description: 'Inactive game',
      short_description: 'Inactive',
      price: '49.99',
      original_price: null,
      category_id: 1,
      sku: 'GAME-C-001',
      stock_quantity: 0,
      digital_key: null,
      platform: 'PC',
      region: 'US',
      status: 'inactive' as const,
      featured: false,
      image_url: null,
      gallery_urls: null,
      meta_title: null,
      meta_description: null,
    }).execute();
  });

  it('should get all products without filters', async () => {
    const result = await getProducts();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Game C'); // Default sort by created_at desc (last inserted)
    expect(result[0].price).toEqual(49.99);
    expect(typeof result[0].price).toBe('number');
    expect(result[0].original_price).toBeNull();
  });

  it('should filter products by category', async () => {
    const filters: ProductFilters = { category_id: 1 };
    const result = await getProducts(filters);

    expect(result).toHaveLength(3);
    result.forEach(product => {
      expect(product.category_id).toEqual(1);
    });
  });

  it('should filter products by price range', async () => {
    const filters: ProductFilters = { min_price: 20, max_price: 40 };
    const result = await getProducts(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Game A');
    expect(result[0].price).toEqual(29.99);
    expect(result[0].original_price).toEqual(39.99);
    expect(typeof result[0].original_price).toBe('number');
  });

  it('should filter products by platform', async () => {
    const filters: ProductFilters = { platform: 'PC' };
    const result = await getProducts(filters);

    expect(result).toHaveLength(2);
    result.forEach(product => {
      expect(product.platform).toEqual('PC');
    });
  });

  it('should filter products by region', async () => {
    const filters: ProductFilters = { region: 'US' };
    const result = await getProducts(filters);

    expect(result).toHaveLength(2);
    result.forEach(product => {
      expect(product.region).toEqual('US');
    });
  });

  it('should filter featured products', async () => {
    const filters: ProductFilters = { featured: true };
    const result = await getProducts(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Game A');
    expect(result[0].featured).toBe(true);
  });

  it('should filter products by status', async () => {
    const filters: ProductFilters = { status: 'active' };
    const result = await getProducts(filters);

    expect(result).toHaveLength(2);
    result.forEach(product => {
      expect(product.status).toEqual('active');
    });
  });

  it('should search products by name', async () => {
    const filters: ProductFilters = { search: 'Game A' };
    const result = await getProducts(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Game A');
  });

  it('should sort products by name ascending', async () => {
    const filters: ProductFilters = { sort_by: 'name', sort_order: 'asc' };
    const result = await getProducts(filters);

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('Game A');
    expect(result[1].name).toEqual('Game B');
    expect(result[2].name).toEqual('Game C');
  });

  it('should sort products by price descending', async () => {
    const filters: ProductFilters = { sort_by: 'price', sort_order: 'desc' };
    const result = await getProducts(filters);

    expect(result).toHaveLength(3);
    expect(result[0].price).toEqual(49.99);
    expect(result[1].price).toEqual(29.99);
    expect(result[2].price).toEqual(19.99);
  });

  it('should apply pagination', async () => {
    const filters: ProductFilters = { limit: 2, offset: 1 };
    const result = await getProducts(filters);

    expect(result).toHaveLength(2);
  });

  it('should combine multiple filters', async () => {
    const filters: ProductFilters = {
      status: 'active',
      platform: 'PC',
      min_price: 25,
      featured: true,
    };
    const result = await getProducts(filters);

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Game A');
    expect(result[0].status).toEqual('active');
    expect(result[0].platform).toEqual('PC');
    expect(result[0].price).toBeGreaterThanOrEqual(25);
    expect(result[0].featured).toBe(true);
  });

  it('should return empty array when no products match filters', async () => {
    const filters: ProductFilters = { platform: 'Xbox' };
    const result = await getProducts(filters);

    expect(result).toHaveLength(0);
  });
});
