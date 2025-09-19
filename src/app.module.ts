import { Module } from "@nestjs/common";
import { CoreModule } from "./core/core.module";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AdminModule } from "./api/admin/admin.module";
import { DoctorModule } from "./api/doctor/doctor.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    JwtModule.register({ global: true }),
    AdminModule,
    CoreModule,
    DoctorModule,
  ],
  controllers: [],
})
export class AppModule {}
