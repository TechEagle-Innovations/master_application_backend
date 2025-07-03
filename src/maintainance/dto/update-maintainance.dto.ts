import { IsOptional, IsString, IsDateString, IsEnum, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMaintenanceChecklistItemDto {
  @IsString()
  @IsOptional()
  item?: string;

  @IsBoolean()
  @IsOptional()
  checked?: boolean;

  @IsDateString()
  @IsOptional()
  checkedAt?: Date;
}

export class UpdateMaintainanceDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  priority?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaintenanceChecklistItemDto)
  @IsOptional()
  maintenanceChecklist?: UpdateMaintenanceChecklistItemDto[];

  @IsDateString()
  @IsOptional()
  resolvedAt?: Date;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsArray()
  @IsOptional()
  attachments?: string[];

  @IsDateString()
  @IsOptional()
  nextScheduledDate?: Date;

  @IsString()
  @IsOptional()
  maintenanceInterval?: string;

  @IsEnum(['HARDWARE', 'SOFTWARE', 'OTHER'])
  @IsOptional()
  issueType?: string;

  @IsEnum(['MINOR', 'MAJOR', 'CRITICAL'])
  @IsOptional()
  issueSeverity?: string;

  @IsString()
  @IsOptional()
  userComments?: string;

  @IsBoolean()
  @IsOptional()
  isResolved?: boolean;
} 