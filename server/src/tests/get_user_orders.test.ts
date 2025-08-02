
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable, ordersTable } from '../db/schema';
import { getUserOrders } from '../handlers/get_user_orders';

describe('getUserOrders', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when user has no orders', async () => {
    // Create a user first
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;
    const orders = await getUserOrders(userId);

    expect(orders).toEqual([]);
  });

  it('should return all orders for a user', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create first order
    await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-001',
        total_amount: '99.99',
        billing_email: 'test@example.com',
        billing_first_name: 'Test',
        billing_last_name: 'User'
      })
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second order
    await db.insert(ordersTable)
      .values({
        user_id: userId,
        order_number: 'ORD-002',
        total_amount: '149.99',
        billing_email: 'test@example.com',
        billing_first_name: 'Test',
        billing_last_name: 'User'
      })
      .execute();

    const orders = await getUserOrders(userId);

    expect(orders).toHaveLength(2);
    expect(orders[0].user_id).toEqual(userId);
    expect(orders[1].user_id).toEqual(userId);
    expect(typeof orders[0].total_amount).toBe('number');
    expect(typeof orders[1].total_amount).toBe('number');
    
    // Verify both orders are present (order may vary due to timing)
    const orderNumbers = orders.map(o => o.order_number).sort();
    expect(orderNumbers).toEqual(['ORD-001', 'ORD-002']);
    
    const totalAmounts = orders.map(o => o.total_amount).sort((a, b) => a - b);
    expect(totalAmounts).toEqual([99.99, 149.99]);
  });

  it('should return orders sorted by creation date descending', async () => {
    // Create a user
    const userResult = await db.insert(usersTable)
      .values({
        email: 'test@example.com',
        password_hash: 'hashed_password',
        first_name: 'Test',
        last_name: 'User'
      })
      .returning()
      .execute();

    const userId = userResult[0].id;

    // Create orders with different timestamps
    const oldDate = new Date('2023-01-01');
    const newDate = new Date('2023-12-31');

    await db.insert(ordersTable)
      .values([
        {
          user_id: userId,
          order_number: 'ORD-OLD',
          total_amount: '50.00',
          billing_email: 'test@example.com',
          billing_first_name: 'Test',
          billing_last_name: 'User',
          created_at: oldDate
        },
        {
          user_id: userId,
          order_number: 'ORD-NEW',
          total_amount: '100.00',
          billing_email: 'test@example.com',
          billing_first_name: 'Test',
          billing_last_name: 'User',
          created_at: newDate
        }
      ])
      .execute();

    const orders = await getUserOrders(userId);

    expect(orders).toHaveLength(2);
    expect(orders[0].order_number).toEqual('ORD-NEW'); // Most recent first
    expect(orders[1].order_number).toEqual('ORD-OLD'); // Older second
    expect(orders[0].created_at >= orders[1].created_at).toBe(true);
  });

  it('should not return orders from other users', async () => {
    // Create two users
    const user1Result = await db.insert(usersTable)
      .values({
        email: 'user1@example.com',
        password_hash: 'hashed_password',
        first_name: 'User',
        last_name: 'One'
      })
      .returning()
      .execute();

    const user2Result = await db.insert(usersTable)
      .values({
        email: 'user2@example.com',
        password_hash: 'hashed_password',
        first_name: 'User',
        last_name: 'Two'
      })
      .returning()
      .execute();

    const user1Id = user1Result[0].id;
    const user2Id = user2Result[0].id;

    // Create orders for both users
    await db.insert(ordersTable)
      .values([
        {
          user_id: user1Id,
          order_number: 'ORD-USER1',
          total_amount: '99.99',
          billing_email: 'user1@example.com',
          billing_first_name: 'User',
          billing_last_name: 'One'
        },
        {
          user_id: user2Id,
          order_number: 'ORD-USER2',
          total_amount: '149.99',
          billing_email: 'user2@example.com',
          billing_first_name: 'User',
          billing_last_name: 'Two'
        }
      ])
      .execute();

    const user1Orders = await getUserOrders(user1Id);
    const user2Orders = await getUserOrders(user2Id);

    expect(user1Orders).toHaveLength(1);
    expect(user2Orders).toHaveLength(1);
    expect(user1Orders[0].order_number).toEqual('ORD-USER1');
    expect(user2Orders[0].order_number).toEqual('ORD-USER2');
  });
});
