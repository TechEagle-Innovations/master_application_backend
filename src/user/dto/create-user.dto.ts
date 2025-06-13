import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { UserDesignation } from '../enums/user-designation.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  useremail: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  userName: string;

  @IsString()
  @IsOptional()
  phone_no?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsDateString()
  @IsOptional()
  date_birth?: Date;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @IsString()
  @IsOptional()
  delivery_location?: string;

  @IsEnum(UserDesignation, { message: 'Invalid designation' })
  @IsOptional()
  designation?: UserDesignation;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsString()
  @IsOptional()
  clientId?: string;
} 