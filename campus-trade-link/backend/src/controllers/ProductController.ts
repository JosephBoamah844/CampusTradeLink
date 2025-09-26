import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { SUCCESS_MESSAGES, PRODUCT_CATEGORIES } from '@campus-trade-link/shared';

export class ProductController {
  private productService = new ProductService();

  createProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const product = await this.productService.createProduct(req.user!.userId, req.body);
    
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_CREATED,
      data: product,
    });
  });

  getProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProductById(id);
    
    res.json({
      success: true,
      data: product,
    });
  });

  updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.updateProduct(id, req.user!.userId, req.body);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_UPDATED,
      data: product,
    });
  });

  deleteProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await this.productService.deleteProduct(id, req.user!.userId);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.PRODUCT_DELETED,
      data: result,
    });
  });

  getProducts = asyncHandler(async (req: Request, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const filters = {
      category: req.query.category as any,
      condition: req.query.condition as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      search: req.query.search as string,
    };

    const products = await this.productService.getProducts(filters, pagination);
    
    res.json({
      success: true,
      data: products,
    });
  });

  getUserProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const products = await this.productService.getUserProducts(userId, pagination);
    
    res.json({
      success: true,
      data: products,
    });
  });

  getMyProducts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const products = await this.productService.getUserProducts(req.user!.userId, pagination);
    
    res.json({
      success: true,
      data: products,
    });
  });

  searchProducts = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const products = await this.productService.searchProducts(q as string, pagination);
    
    res.json({
      success: true,
      data: products,
    });
  });

  getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const products = await this.productService.getProductsByCategory(category as any, pagination);
    
    res.json({
      success: true,
      data: products,
    });
  });

  markProductSold = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.markProductSold(id, req.user!.userId);
    
    res.json({
      success: true,
      message: 'Product marked as sold',
      data: product,
    });
  });

  markProductAvailable = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const product = await this.productService.markProductAvailable(id, req.user!.userId);
    
    res.json({
      success: true,
      message: 'Product marked as available',
      data: product,
    });
  });

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: PRODUCT_CATEGORIES,
    });
  });
}