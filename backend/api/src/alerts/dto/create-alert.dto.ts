import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { AlertSeverity } from '../../common/enums/alert-severity.enum';
import { AlertType } from '../../common/enums/alert-type.enum';

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

  @IsOptional()
  @IsEnum(AlertType)
  type?: AlertType;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}