import { IsNotEmpty, IsString, IsDateString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MaintenanceChecklistItemDto {
  @IsString()
  @IsNotEmpty()
  item: string;

  @IsOptional()
  @IsDateString()
  checkedAt?: Date;
}

export class CreateMaintainanceDto {
  @IsString()
  @IsNotEmpty()
  droneId: string;

  @IsDateString()
  @IsOptional()
  scheduledDate?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  priority?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaintenanceChecklistItemDto)
  @IsOptional()
  maintenanceChecklist?: MaintenanceChecklistItemDto[];

  @IsDateString()
  @IsOptional()
  nextScheduledDate?: Date;

  @IsString()
  @IsOptional()
  maintenanceInterval?: string;
} 