import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SalesItem } from '../../sales-item/entities/sales-item.entity';

@Entity('sales_tickets')
export class SalesTicket {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => SalesItem, (item) => item.ticket)
  items!: SalesItem[];

  @Column({
    unique: true,
    length: 30,
  })
  ticketNumber!: string;

  @Column({
    type: 'timestamp',
  })
  saleDate!: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  totalAmount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}