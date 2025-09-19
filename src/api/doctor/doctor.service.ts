import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateDoctorDto } from "./dto/create-doctor.dto";
import { UpdateDoctorDto } from "./dto/update-doctor.dto";
import { PrismaService } from "../../core/prisma.service";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { Role } from "../../common/enum";
import { IPayload } from "../../common/types";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "../../core/token.service";
import { DoctorSignInDto } from "./dto/doctor-sign-in.dto";

@Injectable()
export class DoctorService {
  constructor(
    private readonly prisma: PrismaService,
    private jwtService: JwtService,
    private tokenService: TokenService
  ) {}

  async doctorSignIn({ email, password }: DoctorSignInDto, res: Response) {
    const doctor = await this.prisma.doctor.findUnique({
      where: {
        email,
      },
    });

    if (!doctor || !(await bcrypt.compare(password, doctor.hashed_password)))
      throw new BadRequestException("Email or password incorrect");

    const payload: IPayload = {
      id: doctor.id,
      role: Role.DOCTOR,
      login: doctor.email,
      isActive: doctor.is_active,
    };

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(payload, res);

    await this.prisma["doctor"].update({
      where: { id: doctor.id },
      data: { hashed_refresh_token: await bcrypt.hash(refreshToken, 7) },
    });

    return {
      statusCode: 200,
      message: "Admin signed in successfully",
      accessToken,
    };
  }

  async create({ password, ...createDoctorDto }: CreateDoctorDto) {
    const { email, phone } = createDoctorDto;
    const {} = createDoctorDto;

    const [emailExists, phoneExists] = await Promise.all([
      this.prisma.doctor.findUnique({
        where: {
          email,
        },
      }),
      this.prisma.doctor.findUnique({ where: { phone } }),
    ]);

    if (emailExists)
      throw new ConflictException(`Doctor with email ${email} already exists`);
    if (phoneExists)
      throw new ConflictException(`Doctor with phone ${phone} already exists`);

    const { id: newDoctorId } = await this.prisma.doctor.create({
      data: {
        ...createDoctorDto,
        hashed_password: await bcrypt.hash(password, 7),
      },
      select: { id: true },
    });

    return {
      statusCode: 201,
      message: "Doctor added successfully",
      newDoctorId,
    };
  }

  async findAll() {
    const allDoctors = await this.prisma.doctor.findMany({
      omit: { hashed_password: true, hashed_refresh_token: true },
    });

    return {
      statusCode: 200,
      message: "All doctors fetched successfully",
      allDoctors,
    };
  }

  async findOne(id: number) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
      omit: { hashed_password: true, hashed_refresh_token: true },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }

    return {
      statusCode: 200,
      message: `Doctor with id ${id} fetched successfully`,
      doctor,
    };
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto) {
    // const { email, phone } = updateDoctorDto;

    if (Object.keys(updateDoctorDto).length === 0) {
      return { statusCode: 200, message: `No changes applied` };
    }

    // if (email) {
    //   const doctor = await this.prisma.doctor.findUnique({
    //     where: { email },
    //   });

    //   if (doctor && doctor.id !== id) {
    //     throw new ConflictException(
    //       `Doctor with email ${email} already exists`
    //     );
    //   }
    // }

    // if (phone) {
    //   const doctor = await this.prisma.doctor.findUnique({
    //     where: { phone },
    //   });

    //   if (doctor && doctor.id !== id) {
    //     throw new ConflictException(
    //       `Doctor with phone ${phone} already exists`
    //     );
    //   }
    // }

    const { count } = await this.prisma.doctor.updateMany({
      where: { id },
      data: updateDoctorDto,
    });

    if (count === 0) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }

    return {
      statusCode: 200,
      message: `Doctor with id ${id} updated successfully`,
      updatedDoctorId: id,
    };
  }

  async remove(id: number) {
    const { count } = await this.prisma.doctor.deleteMany({
      where: { id },
    });
    if (count === 0) {
      throw new NotFoundException(`Doctor with id ${id} not found`);
    }

    return {
      statusCode: 200,
      message: `Doctor with id ${id} deleted successfully`,
      deletedDoctorId: id,
    };
  }
}
