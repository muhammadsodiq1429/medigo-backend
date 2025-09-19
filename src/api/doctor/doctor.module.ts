import { Module } from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { DoctorController } from "./doctor.controller";
import { MailModule } from "../mail/mail.module";

@Module({
  controllers: [DoctorController, MailModule],
  providers: [DoctorService],
})
export class DoctorModule {}
