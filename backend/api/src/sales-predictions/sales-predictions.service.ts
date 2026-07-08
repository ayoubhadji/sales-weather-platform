import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesPrediction } from './entities/sales-prediction.entity';
import { CreateSalesPredictionDto } from './dto/create-sales-prediction.dto';
import { UpdateSalesPredictionDto } from './dto/update-sales-prediction.dto';

@Injectable()
export class SalesPredictionsService {
  constructor(
    @InjectRepository(SalesPrediction)
    private readonly salesPredictionRepository: Repository<SalesPrediction>,
  ) {}

  async create(
    createSalesPredictionDto: CreateSalesPredictionDto,
  ): Promise<SalesPrediction> {
    const salesPrediction = this.salesPredictionRepository.create(
      createSalesPredictionDto,
    );
    return this.salesPredictionRepository.save(salesPrediction);
  }

  async findAll(): Promise<SalesPrediction[]> {
    return this.salesPredictionRepository.find();
  }

  async findOne(id: number): Promise<SalesPrediction> {
    const salesPrediction = await this.salesPredictionRepository.findOne({
      where: { id },
    });

    if (!salesPrediction) {
      throw new NotFoundException(`Sales prediction with ID ${id} not found.`);
    }

    return salesPrediction;
  }

  async update(
    id: number,
    updateSalesPredictionDto: UpdateSalesPredictionDto,
  ): Promise<SalesPrediction> {
    const salesPrediction = await this.findOne(id);
    Object.assign(salesPrediction, updateSalesPredictionDto);
    return this.salesPredictionRepository.save(salesPrediction);
  }

  async remove(id: number): Promise<void> {
    const salesPrediction = await this.findOne(id);
    await this.salesPredictionRepository.remove(salesPrediction);
  }
}
