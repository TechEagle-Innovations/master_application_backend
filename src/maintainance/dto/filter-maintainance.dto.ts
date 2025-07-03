import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class FilterMaintainanceDto {
  @IsString()
  @IsOptional()
  droneId?: string;

  @IsEnum(['REGULAR', 'ISSUE_REPORTED'])
  @IsOptional()
  maintenanceType?: string;

  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  priority?: string;

  @IsDateString()
  @IsOptional()
  fromDate?: Date;

  @IsDateString()
  @IsOptional()
  toDate?: Date;
} 