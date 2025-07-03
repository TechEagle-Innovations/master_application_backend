import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class ReportIssueDto {
  @IsString()
  @IsNotEmpty()
  droneId: string;

  @IsString()
  @IsNotEmpty()
  reportedBy: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['HARDWARE', 'SOFTWARE', 'OTHER'])
  @IsNotEmpty()
  issueType: string;

  @IsEnum(['MINOR', 'MAJOR', 'CRITICAL'])
  @IsNotEmpty()
  issueSeverity: string;

  @IsString()
  @IsOptional()
  userComments?: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  @IsOptional()
  priority?: string;

} 