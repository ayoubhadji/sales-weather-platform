import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { Product } from '../../products/entities/product.entity';
import { SalesTicket } from '../../sales-ticket/entities/sales-ticket.entity';

@Entity('sales_items')
export class SalesItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => SalesTicket, (ticket) => ticket.items)
  ticket!: SalesTicket;

  @ManyToOne(() => Product)
  product!: Product;

  @Column()
  quantity!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  unitPrice!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotal!: number;
}
