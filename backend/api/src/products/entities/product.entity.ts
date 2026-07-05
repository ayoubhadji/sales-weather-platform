import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ProductCategory } from '../../common/enums/product-category.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    length: 100,
  })
  name!: string;

  @Column({
    type: 'enum',
    enum: ProductCategory,
  })
  category!: ProductCategory;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  price!: number;

}