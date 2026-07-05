import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(createAlertDto);
    return this.alertRepository.save(alert);
  }

  async findAll(): Promise<Alert[]> {
    return this.alertRepository.find();
  }

  async findOne(id: number): Promise<Alert> {
    const alert = await this.alertRepository.findOne({ where: { id } });

    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found.`);
    }

    return alert;
  }

  async update(id: number, updateAlertDto: UpdateAlertDto): Promise<Alert> {
    const alert = await this.findOne(id);
    Object.assign(alert, updateAlertDto);
    return this.alertRepository.save(alert);
  }

  async remove(id: number): Promise<void> {
    const alert = await this.findOne(id);
    await this.alertRepository.remove(alert);
  }
}
