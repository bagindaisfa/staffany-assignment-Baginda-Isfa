import { IsDateString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateWeekDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateWeekDto {
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class WeekResponseDto {
  @IsUUID()
  id: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  isPublished: boolean;

  @IsDateString()
  createdAt: string;

  @IsDateString()
  updatedAt: string;
}
