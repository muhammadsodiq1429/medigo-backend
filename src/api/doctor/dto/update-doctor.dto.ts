import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateDoctorDto } from "./create-doctor.dto";

export class UpdateDoctorDto extends OmitType(PartialType(CreateDoctorDto), [
  "email",
  "gender",
  "password",
  "phone",
  "since_experience",
] as const) {}
