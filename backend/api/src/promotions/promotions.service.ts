import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const product = await this.productRepository.findOne({
      where: { id: createPromotionDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const promotion = this.promotionRepository.create({
      product,
      discountPercentage: createPromotionDto.discountPercentage,
      reason: createPromotionDto.reason,
      startDate: createPromotionDto.startDate,
      endDate: createPromotionDto.endDate,
    });

    return await this.promotionRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return this.promotionRepository.find({
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
      relations: { product: true },
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found.`);
    }

    return promotion;
  }

  async update(
    id: number,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    const promotion = await this.findOne(id);
    Object.assign(promotion, updatePromotionDto);
    return this.promotionRepository.save(promotion);
  }

  async remove(id: number): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }

  /**
   * Actually discounts the product's current price by discountPercentage,
   * and remembers the pre-discount price so it can be reverted later.
   * Safe to call only once per promotion — throws if already applied.
   */
  async apply(id: number): Promise<Promotion> {
    const promotion = await this.findOne(id);

    if (promotion.applied) {
      throw new BadRequestException('This promotion has already been applied.');
    }

    const product = promotion.product;
    const currentPrice = Number(product.price);
    const discountedPrice =
      Math.round(currentPrice * (1 - Number(promotion.discountPercentage) / 100) * 100) / 100;

    product.price = discountedPrice;
    await this.productRepository.save(product);

    promotion.applied = true;
    promotion.originalPrice = currentPrice;
    return this.promotionRepository.save(promotion);
  }

  /**
   * Restores the product's price to what it was before this promotion was
   * applied. Safe to call only if the promotion is currently applied.
   */
  async revert(id: number): Promise<Promotion> {
    const promotion = await this.findOne(id);

    if (!promotion.applied || promotion.originalPrice === null) {
      throw new BadRequestException('This promotion has not been applied.');
    }

    const product = promotion.product;
    product.price = Number(promotion.originalPrice);
    await this.productRepository.save(product);

    promotion.applied = false;
    promotion.originalPrice = null;
    return this.promotionRepository.save(promotion);
  }
} 