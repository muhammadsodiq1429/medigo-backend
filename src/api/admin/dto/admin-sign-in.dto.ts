import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class AdminSignInDto {
  @ApiProperty({ type: String, example: "sodiq" })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  username: string;

  @ApiProperty({ type: String, example: "sodiq" })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: { value: string }) => value.trim())
  password: string;
}
