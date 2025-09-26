import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { CreateProductSchema, UpdateProductSchema } from '@campus-trade-link/shared';
import { z } from 'zod';

const router = Router();
const productController = new ProductController();

// GET /products - Get all products with filters
router.get('/', validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  search: z.string().optional(),
})), productController.getProducts);

// GET /products/categories - Get product categories
router.get('/categories', productController.getCategories);

// GET /products/me - Get current user's products
router.get('/me', authenticate, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), productController.getMyProducts);

// GET /products/search - Search products
router.get('/search', validateQuery(z.object({
  q: z.string().min(1),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), productController.searchProducts);

// GET /products/category/:category - Get products by category
router.get('/category/:category', validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), productController.getProductsByCategory);

// POST /products - Create new product
router.post('/', authenticate, validateBody(CreateProductSchema), productController.createProduct);

// GET /products/:id - Get specific product
router.get('/:id', productController.getProduct);

// PUT /products/:id - Update product
router.put('/:id', authenticate, validateBody(UpdateProductSchema), productController.updateProduct);

// DELETE /products/:id - Delete product
router.delete('/:id', authenticate, productController.deleteProduct);

// POST /products/:id/sold - Mark product as sold
router.post('/:id/sold', authenticate, productController.markProductSold);

// POST /products/:id/available - Mark product as available
router.post('/:id/available', authenticate, productController.markProductAvailable);

// GET /products/user/:userId - Get user's products
router.get('/user/:userId', validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), productController.getUserProducts);

export default router;