import { ApiProperty } from "@nestjs/swagger";
import { gender, region_enum } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from "class-validator";

export class CreateDoctorDto {
  @ApiProperty({ example: "Alisher" })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  first_name: string;

  @ApiProperty({ example: "Vohidov" })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  last_name: string;

  @ApiProperty({ example: "alisher.vohidov@example.com" })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  email: string;

  @ApiProperty({ example: "+998901234567" })
  @IsNotEmpty()
  @IsPhoneNumber("UZ")
  @Transform(({ value }: { value: string }) => value.trim())
  phone: string;

  @ApiProperty({ example: "male" })
  @IsNotEmpty()
  @IsEnum(gender)
  @Transform(({ value }: { value: string }) => value.trim())
  gender: gender;

  @ApiProperty({ example: "1985-05-15" })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: string }) => new Date(value).toISOString())
  date_of_birth?: string;

  @ApiProperty({ example: "Toshkent_shahar" })
  @IsOptional()
  @IsEnum(region_enum)
  region?: region_enum;

  @ApiProperty({ example: "StrongP@ssw0rd123" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Transform(({ value }: { value: string }) => value.trim())
  password: string;

  @ApiProperty({ example: "2010-09-01" })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }: { value: string }) => new Date(value).toISOString())
  since_experience?: string;
}
