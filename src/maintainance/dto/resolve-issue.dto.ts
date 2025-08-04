import { 
  IsBoolean, 
  IsEnum, 
  IsOptional, 
  IsString, 
  IsDate, 
  IsArray, 
  ValidateNested, 
  IsNotEmpty, 
  IsMongoId,
  IsIn
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaintenanceAction } from 'src/schema/maintainance/droneMaintenance.schema';

class ChecklistUpdateDto {
  @IsMongoId()
  @IsNotEmpty()
  itemId: string;

  @IsBoolean()
  checked: boolean;

  @IsMongoId()
  @IsNotEmpty()
  checkedBy: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

class ActionTakenDto implements Partial<MaintenanceAction> {
  @IsString()
  @IsNotEmpty()
  action: string;

  // @IsMongoId()
  // @IsNotEmpty()
  // performedBy?: any;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  performedAt?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ResolveMaintenanceDto {
  @IsEnum(['COMPLETED', 'CANCELLED'], {
    message: 'Status must be either COMPLETED or CANCELLED for resolution'
  })
  status: 'COMPLETED' | 'CANCELLED';

  @IsBoolean()
  isResolved: boolean;

  // @IsString()
  // @IsOptional()
  // resolutionNotes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActionTakenDto)
  @IsOptional()
  actionsTaken?: ActionTakenDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistUpdateDto)
  @IsOptional()
  checklistUpdates?: ChecklistUpdateDto[];

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  updatedAt?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  resolvedAt?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  nextScheduledDate?: Date;

  @IsString()
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'], {
    message: 'Invalid maintenance interval'
  })
  maintenanceInterval?: string;
}