import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class DoctorSignInDto {
  @ApiProperty({ example: "" })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: "" })
  @IsNotEmpty()
  @IsString()
  password: string;
}
