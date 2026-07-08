import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from '../../products/entities/product.entity';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Product, { nullable: false })
  product!: Product;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  discountPercentage!: number;

  @Column({
    length: 255,
  })
  reason!: string;

  @Column({
    type: 'date',
  })
  startDate!: Date;

  @Column({
    type: 'date',
  })
  endDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
