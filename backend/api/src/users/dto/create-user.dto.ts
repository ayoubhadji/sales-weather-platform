import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  IsBoolean,
} from 'class-validator';

import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @IsString()
  @Length(3, 150)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 100)
  password!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}