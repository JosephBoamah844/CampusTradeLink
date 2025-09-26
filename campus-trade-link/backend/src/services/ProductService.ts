import { eq, and, or, like, desc, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { products, users, userStats } from '../db/schema';
import { 
  Product,
  CreateProductInput, 
  UpdateProductInput,
  PaginationParams,
  PaginatedResponse,
  ProductCategoryType 
} from '@campus-trade-link/shared';
import { createError } from '../middleware/errorHandler';

export interface ProductFilters {
  category?: ProductCategoryType;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  userId?: string;
}

export class ProductService {
  async createProduct(userId: string, input: CreateProductInput): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values({
        userId,
        title: input.title,
        description: input.description,
        price: input.price.toString(),
        imageUrls: input.imageUrls,
        category: input.category,
        condition: input.condition,
        location: input.location,
      })
      .returning();

    // Update user stats
    await db
      .update(userStats)
      .set({
        productsCount: sql`${userStats.productsCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    return this.getProductById(newProduct.id);
  }

  async getProductById(productId: string): Promise<Product> {
    const [product] = await db
      .select({
        id: products.id,
        userId: products.userId,
        title: products.title,
        description: products.description,
        price: products.price,
        imageUrls: products.imageUrls,
        category: products.category,
        condition: products.condition,
        isAvailable: products.isAvailable,
        location: products.location,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
      })
      .from(products)
      .innerJoin(users, eq(products.userId, users.id))
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      throw createError('Product not found', 404, 'NOT_FOUND');
    }

    // Increment view count
    await db
      .update(products)
      .set({
        viewsCount: sql`${products.viewsCount} + 1`,
      })
      .where(eq(products.id, productId));

    return {
      ...product,
      price: parseFloat(product.price),
    };
  }

  async updateProduct(productId: string, userId: string, input: UpdateProductInput): Promise<Product> {
    // Verify ownership
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.userId, userId)))
      .limit(1);

    if (!existingProduct) {
      throw createError('Product not found or unauthorized', 404, 'NOT_FOUND');
    }

    const updateData: any = {
      ...input,
      updatedAt: new Date(),
    };

    if (input.price !== undefined) {
      updateData.price = input.price.toString();
    }

    await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId));

    return this.getProductById(productId);
  }

  async deleteProduct(productId: string, userId: string): Promise<{ message: string }> {
    // Verify ownership
    const [existingProduct] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.userId, userId)))
      .limit(1);

    if (!existingProduct) {
      throw createError('Product not found or unauthorized', 404, 'NOT_FOUND');
    }

    await db.delete(products).where(eq(products.id, productId));

    // Update user stats
    await db
      .update(userStats)
      .set({
        productsCount: sql`${userStats.productsCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    return {
      message: 'Product deleted successfully',
    };
  }

  async getProducts(
    filters: ProductFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    let whereConditions = [eq(products.isAvailable, true)];

    // Apply filters
    if (filters.category) {
      whereConditions.push(eq(products.category, filters.category));
    }

    if (filters.condition) {
      whereConditions.push(eq(products.condition, filters.condition));
    }

    if (filters.minPrice !== undefined) {
      whereConditions.push(gte(sql`CAST(${products.price} AS DECIMAL)`, filters.minPrice));
    }

    if (filters.maxPrice !== undefined) {
      whereConditions.push(lte(sql`CAST(${products.price} AS DECIMAL)`, filters.maxPrice));
    }

    if (filters.userId) {
      whereConditions.push(eq(products.userId, filters.userId));
    }

    if (filters.search) {
      whereConditions.push(
        or(
          like(products.title, `%${filters.search}%`),
          like(products.description, `%${filters.search}%`)
        )
      );
    }

    const productList = await db
      .select({
        id: products.id,
        userId: products.userId,
        title: products.title,
        description: products.description,
        price: products.price,
        imageUrls: products.imageUrls,
        category: products.category,
        condition: products.condition,
        isAvailable: products.isAvailable,
        location: products.location,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
          isVerified: users.isVerified,
        },
      })
      .from(products)
      .innerJoin(users, and(eq(products.userId, users.id), eq(users.isActive, true)))
      .where(and(...whereConditions))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(products.createdAt));

    const hasMore = productList.length > limit;
    const data = hasMore ? productList.slice(0, -1) : productList;

    return {
      data: data.map(product => ({
        ...product,
        price: parseFloat(product.price),
      })),
      hasMore,
    };
  }

  async getUserProducts(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ userId }, pagination);
  }

  async searchProducts(
    query: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ search: query }, pagination);
  }

  async getProductsByCategory(
    category: ProductCategoryType,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Product>> {
    return this.getProducts({ category }, pagination);
  }

  async markProductSold(productId: string, userId: string): Promise<Product> {
    return this.updateProduct(productId, userId, { isAvailable: false });
  }

  async markProductAvailable(productId: string, userId: string): Promise<Product> {
    return this.updateProduct(productId, userId, { isAvailable: true });
  }
}