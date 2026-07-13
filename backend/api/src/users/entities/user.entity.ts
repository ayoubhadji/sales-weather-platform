import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { UserRole } from '../../common/enums/user-role.enum';
import { SalesTicket } from 'src/sales-ticket/entities/sales-ticket.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => SalesTicket, (ticket) => ticket.user)
  salesTickets!: SalesTicket[];

  @Column({
    length: 100,
  })
  name!: string;

  @Column({
    unique: true,
    length: 150,
  })
  email!: string;

  @Column()
  password!: string;

  @Column({
    length: 100,
    nullable: true,
  })
  city?: string;

  @Column({
    length: 255,
    nullable: true,
  })
  address?: string;

  @Column({
    length: 20,
    nullable: true,
  })
  phone?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}