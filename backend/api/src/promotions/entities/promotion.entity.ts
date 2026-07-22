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

  // Whether the discount has actually been applied to the product's price
  // (as opposed to just being a planned/recorded promotion).
  @Column({
    default: false,
  })
  applied!: boolean;

  // The product's price right before this promotion was applied, so it can
  // be restored exactly if the promotion is reverted later.
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  originalPrice!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}