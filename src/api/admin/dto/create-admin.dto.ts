import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateAdminDto {
  @ApiProperty({
    type: String,
    example: "adminuser",
    uniqueItems: true,
  })
  @IsString()
  @MinLength(5)
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? value.trim().toLowerCase() : undefined
  )
  username: string;

  @ApiProperty({
    type: String,
    example: "Admin User",
  })
  @IsString()
  @MinLength(5)
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? value.trim() : undefined
  )
  fullname: string;

  @ApiProperty({
    type: Boolean,
    example: true,
    default: true,
  })
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    type: String,
    example: "adminuser",
  })
  @MinLength(8)
  @Transform(({ value }: { value: string }) =>
    value !== undefined ? value.trim() : undefined
  )
  password: string;
}
