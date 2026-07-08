import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// Marks this class as a NestJS service that can be injected elsewhere
@Injectable()
export class ProductsService {
  // Inject the Product repository
  // This repository allows us to communicate with the database
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}
  /**
   * CREATE A NEW PRODUCT
   * Equivalent SQL:INSERT INTO products (...)
   */
  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Create a Product object from the DTO
    // (Nothing is saved yet)
    const product = this.productsRepository.create(createProductDto);

    // Save the product into PostgreSQL
    return await this.productsRepository.save(product);
  }

  /**
   * GET ALL PRODUCTS
   * Equivalent SQL: SELECT * FROM products;
   */
  async findAll(): Promise<Product[]> {
    // Return all products from the database
    return await this.productsRepository.find();
  }

  /**
   * GET ONE PRODUCT BY ID
   * Equivalent SQL: SELECT * FROM products WHERE id = ?;
   */
  async findOne(id: number): Promise<Product> {
    // Search for a product with the given ID
    const product = await this.productsRepository.findOne({
      where: { id },
    });

    // If no product exists, return HTTP 404
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }

    return product;
  }

  /**
   * UPDATE AN EXISTING PRODUCT
   * Equivalent SQL: UPDATE products SET ... WHERE id = ?;
   */
  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    // First, make sure the product exists
    const product = await this.findOne(id);

    // Copy the new values into the existing object
    Object.assign(product, updateProductDto);

    // Save the updated object
    return await this.productsRepository.save(product);
  }

  /**
   * DELETE A PRODUCT
   * Equivalent SQL: DELETE FROM products WHERE id = ?;
   */
  async remove(id: number): Promise<void> {
    // Verify the product exists
    const product = await this.findOne(id);

    // Remove it from the database
    await this.productsRepository.remove(product);
  }
}
