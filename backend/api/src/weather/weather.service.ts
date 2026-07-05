import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Weather } from './entities/weather.entity';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';

@Injectable()
export class WeatherService {
  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) {}

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    const weather = this.weatherRepository.create(createWeatherDto);
    return this.weatherRepository.save(weather);
  }

  async findAll(): Promise<Weather[]> {
    return this.weatherRepository.find();
  }

  async findOne(id: number): Promise<Weather> {
    const weather = await this.weatherRepository.findOne({ where: { id } });

    if (!weather) {
      throw new NotFoundException(`Weather record with ID ${id} not found.`);
    }

    return weather;
  }

  async update(id: number, updateWeatherDto: UpdateWeatherDto): Promise<Weather> {
    const weather = await this.findOne(id);
    Object.assign(weather, updateWeatherDto);
    return this.weatherRepository.save(weather);
  }

  async remove(id: number): Promise<void> {
    const weather = await this.findOne(id);
    await this.weatherRepository.remove(weather);
  }
}
