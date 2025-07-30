import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CellVoltageDto {
  @IsNumber() v1: number;
  @IsNumber() v2: number;
  @IsNumber() v3: number;
  @IsNumber() v4: number;
  @IsNumber() v5: number;
  @IsNumber() v6: number;
}

export class ChargeHistoryDto {
  @IsOptional() @Type(() => Date) charge_start_time?: Date;
  @IsOptional() @Type(() => Date) charge_end_time?: Date;

  @IsOptional() cell_voltage?: Map<string, number>;

  @IsOptional() @IsNumber() maxVdiff?: number;
  @IsOptional() @IsNumber() voltage_before_charge?: number;
  @IsOptional() @IsNumber() voltage_after_charge?: number;

  @IsOptional() @IsString() remark?: string;
  @IsOptional() @IsString() monitor_by?: string;
}

export class FlightHistoryDto {
   @IsString() flightId?: string;
   @IsString() droneId?: string;
   @IsString() installed_by?: string;
  @IsOptional() @IsString() companion_id?: string;
}

export class CreateBatteryDto {
  @IsString() model: string;

  @IsNumber() num_of_cells: number;

  @IsNumber() voltage: number;

  @IsNumber() mah: number;

  @IsEnum(['lipo', 'li-ion']) battery_type: string;

  @IsString() image?: string;

  @IsNumber() current_voltage: number;

  @IsNumber() curr_max_vdiff?: number;
}
