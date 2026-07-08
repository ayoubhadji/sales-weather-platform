import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';
import { AlertSeverity } from '../../common/enums/alert-severity.enum';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsEnum(AlertSeverity)
  severity!: AlertSeverity;

  @IsBoolean()
  isRead!: boolean;
}
