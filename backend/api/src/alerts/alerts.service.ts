import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertSeverity } from '../common/enums/alert-severity.enum';
import { AlertType } from '../common/enums/alert-type.enum';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(createAlertDto);
    return this.alertRepository.save(alert);
  }

  async findAll(): Promise<Alert[]> {
    return this.alertRepository.find({ order: { createdAt: 'DESC' } });
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

  /**
   * Internal helper other services call to raise an alert automatically
   * (weather/demand, ML, promotions, sales, products, system). Skips
   * creating a duplicate if an alert with the same title+type was already
   * raised within `dedupeWindowHours` — prevents the nightly cron from
   * spamming the same alert every day it re-detects the same condition.
   */
  async raiseOnce(params: {
    title: string;
    message: string;
    severity: AlertSeverity;
    type: AlertType;
    dedupeWindowHours?: number;
  }): Promise<Alert | null> {
    const dedupeWindowHours = params.dedupeWindowHours ?? 24;
    const since = new Date(Date.now() - dedupeWindowHours * 60 * 60 * 1000);

    const existing = await this.alertRepository.findOne({
      where: {
        title: params.title,
        type: params.type,
        createdAt: MoreThan(since),
      },
    });

    if (existing) {
      this.logger.log(`Skipped duplicate alert "${params.title}" (raised within last ${dedupeWindowHours}h)`);
      return null;
    }

    const alert = this.alertRepository.create({
      title: params.title,
      message: params.message,
      severity: params.severity,
      type: params.type,
      isRead: false,
    });

    const saved = await this.alertRepository.save(alert);
    this.logger.log(`Raised alert [${params.type}/${params.severity}]: ${params.title}`);
    return saved;
  }
}