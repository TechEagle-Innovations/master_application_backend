import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  isArray,
  IsObject,
  IsISO8601,
  IsDefined,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CellVoltageDto {
  @IsNumber() v1: number;
  @IsNumber() v2: number;
  @IsNumber() v3: number;
  @IsNumber() v4: number;
  @IsNumber() v5: number;
  @IsNumber() v6: number;
}

export class FlightHistoryDto {
  @IsArray() @IsString({ each: true }) all_battery: string[];
  @IsString() flightId: string;
  @IsString() droneId: string;
  //@IsString() installed_by?: string;
}

export class DisconnectBatteryDto {
  @IsArray() @IsString({ each: true }) all_Battery: string[];
  @IsObject() batteryVoltages: Record<string, number>;
  @IsString() end_location: string;
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

export class ChargeHistoryDto {
  @IsDefined()
  @IsDateString()
  charge_start_time: string;
  @IsDefined()
  @IsDateString()
  charge_end_time: string;

  @IsOptional()
  @IsNumber()
  charging_hours?: number;

  @IsDefined()
  @IsObject()
  cell_voltage: Record<string, number>;

  @IsNumber()
  maxVdiff: number;

  @IsNumber()
  voltage_before_charge: number;

  @IsNumber()
  voltage_after_charge: number;

  @IsString()
  remark: string;

  @IsString()
  monitor_by: string;
}
