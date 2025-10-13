import {
  IsNumber,
  IsString,
  Max,
  Min,
  IsLongitude,
  IsLatitude,
  IsBoolean,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Max(2030)
  year: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;

  @IsLongitude()
  lng: number;

  @IsLatitude()
  lat: number;

  @IsBoolean()
  approved: boolean;
}
