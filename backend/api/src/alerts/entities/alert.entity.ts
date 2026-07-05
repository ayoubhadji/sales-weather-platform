import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AlertSeverity } from '../../common/enums/alert-severity.enum';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    length: 150,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  message!: string;

  @Column({
    type: 'enum',
    enum: AlertSeverity,
  })
  severity!: AlertSeverity;

  @Column({
    default: false,
  })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}