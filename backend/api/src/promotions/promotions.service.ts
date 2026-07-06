import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.promotionRepository.find();
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({ where: { id } });

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found.`);
    }

    return promotion;
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);
    Object.assign(promotion, updatePromotionDto);
    return this.promotionRepository.save(promotion);
  }

  async remove(id: number): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }
}
