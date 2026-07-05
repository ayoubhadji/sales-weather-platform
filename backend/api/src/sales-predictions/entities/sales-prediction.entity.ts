import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { Weather } from '../../weather/entities/weather.entity';

@Entity('sales_predictions')
export class SalesPrediction {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Product)
  product!: Product;

  @ManyToOne(() => Weather)
  weather!: Weather;

  @Column({
    type: 'date',
  })
  predictionDate!: Date;

  @Column({
    type: 'integer',
  })
  predictedQuantity!: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  confidence!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({
  type: 'decimal',
  precision: 10,
  scale: 2,
})
predictedRevenue!: number;

}