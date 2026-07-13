import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SalesItem } from '../../sales-item/entities/sales-item.entity';
import { User } from 'src/users/entities/user.entity';

@Entity('sales_tickets')
export class SalesTicket {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => SalesItem, (item) => item.ticket)
  items!: SalesItem[];
  
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

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
