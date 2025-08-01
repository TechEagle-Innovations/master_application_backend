import { IsString, IsNotEmpty, IsObject, IsEnum, IsUrl } from 'class-validator';

export enum DefectClassName {
  CRACK = 'crack',
  DENT = 'dent',
  PAINT_OFF = 'paint-off',
  SCRATCH = 'scratch',
  MISSING_HEAD = 'missing-head',
  ALL_GOOD = 'all-good'
}

export class ImagePartDto {
  @IsUrl()
  url: string;

  @IsEnum(DefectClassName)
  defectClassName: DefectClassName;
}

export class CreateDroneImagesAIDto {
  @IsString()
  @IsNotEmpty()
  droneId: string;

  @IsObject()
  imageParts: Record<string, ImagePartDto>;
} 