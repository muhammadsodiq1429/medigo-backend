import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  Res,
} from "@nestjs/common";
import { DoctorService } from "./doctor.service";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update-doctor.dto";
import { JwtAuthGuard } from "../../common/guards/jwt.auth.guard";
import { RolesGuard } from "../../common/guards/role.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../common/enum";
import { SelfGuard } from "../../common/guards/self.guard";
import { Response } from "express";
import { DoctorSignInDto } from "./dto/doctor-sign-in.dto";

@Controller("doctor")
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @HttpCode(200)
  @Post("sign-in")
  adminSignIn(
    @Body() doctorSignInDto: DoctorSignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.doctorService.doctorSignIn(doctorSignInDto, res);
  }

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Get()
  findAll() {
    return this.doctorService.findAll();
  }

  @UseGuards(JwtAuthGuard, SelfGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.doctorService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, SelfGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(+id, updateDoctorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.doctorService.remove(+id);
  }
}
