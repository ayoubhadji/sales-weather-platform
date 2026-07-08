import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WeatherCondition } from '../../common/enums/weather-condition.enum';

@Entity('weather')
export class Weather {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'date',
    unique: true,
  })
  weatherDate!: Date;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  temperature!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  humidity!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  rainfall!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  windSpeed!: number;

  @Column({
    type: 'enum',
    enum: WeatherCondition,
  })
  weatherCondition!: WeatherCondition;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
