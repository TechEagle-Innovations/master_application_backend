import { PartialType } from '@nestjs/swagger';
import { CreateFleetDto } from './create-fleet.dto';

export class UpdateFleetDto extends PartialType(CreateFleetDto) {}


import { IsArray, IsISO8601, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PocDetailsDto {
  @IsString()
  @IsNotEmpty()
  pocName: string;

  @IsString()
  @IsNotEmpty()
  phone_no: string;
}

export class DeliveryDetailsDto {
  @IsArray()
  @IsString({ each: true })
  deliveredItemImage: string[];

  @IsOptional()
  @IsString()
  otp?: string;

  @IsString()
  @IsNotEmpty()
  AWB: string;

  @IsISO8601()
  deliveredTime: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PocDetailsDto)
  pocDetails: PocDetailsDto;
}
