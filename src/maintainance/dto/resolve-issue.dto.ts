import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { DroneMaintenance } from 'src/schema/maintainance/droneMaintenance.schema';

export class ResolveMaintenanceDto {
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status: DroneMaintenance['status'];

  @IsBoolean()
  isResolved: boolean;

  /** Optional: if you really need client to send a custom updatedAt */
  @IsOptional()
  @Type(() => Date)
  updatedAt?: Date;
}
