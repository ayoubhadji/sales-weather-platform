import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AlertSeverity } from '../../common/enums/alert-severity.enum';
import { AlertType } from '../../common/enums/alert-type.enum';

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

  // Categorizes where the alert came from (weather-driven demand drop,
  // ML pipeline issue, promotion expiring, sales anomaly, stale product,
  // or a generic system issue). Defaults to SYSTEM for older rows.
  @Column({
    type: 'enum',
    enum: AlertType,
    default: AlertType.SYSTEM,
  })
  type!: AlertType;

  @Column({
    default: false,
  })
  isRead!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}