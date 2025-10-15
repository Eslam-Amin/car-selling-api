import { PartialType } from '@nestjs/mapped-types';
import { GetEstimateDto } from './get-estimate.dto';
import { Transform } from 'class-transformer';
import { IsNumber, Max, Min, IsBoolean, IsOptional } from 'class-validator';

export class GetReportsDto extends PartialType(GetEstimateDto) {
  @IsNumber()
  @Min(0)
  @Max(1000000)
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  price: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    else if (value === 'false') return false;
    return value;
  })
  approved: boolean;
}
