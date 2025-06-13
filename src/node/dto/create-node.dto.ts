import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LogisticsTypeSupportedDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

class FacilitiesDto {
  @IsString()
  @IsOptional()
  hospital?: string;

  @IsString()
  @IsOptional()
  ATC?: string;

  @IsString()
  @IsOptional()
  policeStation?: string;

  @IsString()
  @IsOptional()
  fireBrigade?: string;

  @IsString()
  @IsOptional()
  bloodBank?: string;
}

class NetworkAvailabilityDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  operations?: string[];

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

class CGStandDto {
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

class LocationOperationalDetailsDto {
  @IsBoolean()
  @IsOptional()
  QRLanding?: boolean;

  @IsString()
  surfaceType: string;

  @IsNumber()
  @IsOptional()
  areaAvailable?: number;

  @ValidateNested()
  @Type(() => NetworkAvailabilityDto)
  @IsOptional()
  networkAvailability?: NetworkAvailabilityDto;

  @IsString()
  storageFacilityTypeandCapacity: string;

  @IsString()
  chargingFacilityTypes: string;

  @IsNumber()
  @IsOptional()
  electricityTimings?: number;

  @IsBoolean()
  @IsOptional()
  shadesForPilots?: boolean;

  @ValidateNested()
  @Type(() => CGStandDto)
  @IsOptional()
  CG_Stand?: CGStandDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  compatibleDrones?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  currentUseCases?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  potentialUseCases?: string[];

  @ValidateNested()
  @Type(() => FacilitiesDto)
  @IsOptional()
  nearestFacilities?: FacilitiesDto;
}

export class CreateNodeDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  location_name: string;

  @IsString()
  country_id: string;

  @IsString()
  zone_id: string;

  @IsString()
  state_id: string;

  @IsString()
  state: string;

  @IsString()
  relatedHubs: string;

  @IsString()
  @IsOptional()
  roadDistance?: string;

  @IsString()
  @IsOptional()
  roadTime?: string;

  @IsString()
  district: string;

  @IsString()
  address: string;

  @IsNumber()
  pin_code: number;

  @IsString()
  tag_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LogisticsTypeSupportedDto)
  @IsOptional()
  logisticsTypeSupported?: LogisticsTypeSupportedDto[];

  @IsNumber()
  @IsOptional()
  maxFlightTime?: number;

  @IsNumber()
  @IsOptional()
  aerialDistance?: number;

  @IsNumber()
  @IsOptional()
  aerialTime?: number;

  @ValidateNested()
  @Type(() => LocationOperationalDetailsDto)
  @IsOptional()
  operationalDetails?: LocationOperationalDetailsDto;
}
