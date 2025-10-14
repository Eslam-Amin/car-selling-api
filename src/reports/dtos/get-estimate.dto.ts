import {
  IsNumber,
  IsString,
  Max,
  Min,
  IsLongitude,
  IsLatitude,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetEstimateDto {
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  make: string;

  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  model: string;

  @IsNumber()
  @Max(2030)
  @Transform(({ value }) => parseInt(value))
  year: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  @Transform(({ value }) => parseInt(value))
  mileage: number;

  @IsLongitude()
  @Transform(({ value }) => parseFloat(value))
  lng: number;

  @IsLatitude()
  @Transform(({ value }) => parseFloat(value))
  lat: number;
}
