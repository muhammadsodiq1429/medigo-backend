import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { AdminSignInDto } from "./dto/admin-sign-in.dto";
import * as bcrypt from "bcrypt";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Response } from "express";
import { PrismaService } from "../../core/prisma.service";
import { IPayload } from "../../common/types";
import { Role } from "../../common/enum";
import { TokenService } from "../../core/token.service";

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private tokenService: TokenService
  ) {}

  async onModuleInit() {
    await this.prisma.admin.upsert({
      create: {
        hashed_password: await bcrypt.hash(process.env.ADMIN_PASSWORD!, 7),
        username: process.env.ADMIN_USERNAME!,
        fullname: process.env.ADMIN_FULLNAME!,
        is_superadmin: true,
      },
      update: {
        is_superadmin: true,
        username: process.env.ADMIN_USERNAME!,
      },
      where: { username: process.env.ADMIN_USERNAME! },
    });
  }

  async adminSignIn({ username, password }: AdminSignInDto, res: Response) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        username,
      },
    });

    if (!admin || !(await bcrypt.compare(password, admin.hashed_password)))
      throw new BadRequestException("Username or password incorrect");

    const payload: IPayload = {
      id: admin.id,
      role: admin.is_superadmin ? Role.SUPERADMIN : Role.ADMIN,
      login: admin.username,
      isActive: admin.is_active,
    };

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(payload, res);

    await this.prisma["admin"].update({
      where: { id: admin.id },
      data: { hashed_refresh_token: await bcrypt.hash(refreshToken, 7) },
    });

    return {
      statusCode: 200,
      message: "Admin signed in successfully",
      accessToken,
    };
  }

  async adminSignOut(refreshToken: string, res: Response) {
    let adminData: IPayload | any = null;
    try {
      adminData = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Token has expired.");
      }
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException("Invalid token.");
      }

      throw new BadRequestException(
        "An error occurred during token verification."
      );
    }

    const { count } = await this.prisma.admin.updateMany({
      where: { id: adminData.id },
      data: { hashed_refresh_token: null },
    });

    if (count === 0) {
      throw new UnauthorizedException("Admin not found");
    }

    res.clearCookie("refresh_token", { secure: true, httpOnly: true });

    return { statusCode: 200, message: "Admin signed out successfully" };
  }

  async adminRefreshToken(id: number, refreshToken: string, res: Response) {
    try {
      const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });

      if (id !== decodedToken.id) {
        throw new ForbiddenException("Invalid token payload");
      }

      const admin = await this.prisma.admin.findUnique({ where: { id } });
      if (!admin || !admin.hashed_refresh_token) {
        throw new NotFoundException(
          "User not found or refresh token is missing"
        );
      }

      const tokenMatch = await bcrypt.compare(
        refreshToken,
        admin.hashed_refresh_token
      );

      if (!tokenMatch) {
        throw new ForbiddenException("Token mismatch");
      }

      const payload: IPayload = {
        id: admin.id,
        role: admin.is_superadmin ? Role.SUPERADMIN : Role.ADMIN,
        login: admin.username,
        isActive: admin.is_active,
      };

      const { accessToken, refreshToken: newRefreshToken } =
        await this.tokenService.generateTokens(payload, res);

      await this.prisma.admin.update({
        where: { id },
        data: { hashed_refresh_token: await bcrypt.hash(refreshToken, 7) },
      });

      return {
        message: "Admin tokens refreshed",
        adminId: admin.id,
        accessToken,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException("Invalid or expired refresh token");
    }
  }

  async create({ password, ...createAdminDto }: CreateAdminDto) {
    const adminExists = await this.prisma.admin.findUnique({
      where: { username: createAdminDto.username },
    });
    if (adminExists) {
      throw new ConflictException(
        `Admin with username ${createAdminDto.username} already exists`
      );
    }

    const { id: newAdminId } = await this.prisma.admin.create({
      data: {
        ...createAdminDto,
        hashed_password: await bcrypt.hash(password, 7),
      },
      omit: {
        hashed_password: true,
      },
    });

    return { statusCode: 201, message: "Admin added successfully", newAdminId };
  }

  async findAll() {
    const allAdmins = await this.prisma.admin.findMany({
      omit: { hashed_password: true, hashed_refresh_token: true },
      where: { is_superadmin: false },
    });

    return {
      statusCode: 200,
      message: "All admins fetched successfully",
      allAdmins,
    };
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      omit: { hashed_password: true },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    return {
      statusCode: 200,
      message: `Admin with id ${id} fetched successfully`,
      admin,
    };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const { username } = updateAdminDto;

    if (Object.keys(updateAdminDto).length === 0) {
      return { statusCode: 200, message: `No changes applied` };
    }

    if (username) {
      const admin = await this.prisma.admin.findUnique({
        where: { username },
      });

      if (admin && admin.id !== id) {
        throw new ConflictException(
          `Admin with username ${username} already exists`
        );
      }
    }

    const { count } = await this.prisma.admin.updateMany({
      where: { id },
      data: updateAdminDto,
    });

    if (count === 0) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    return {
      statusCode: 200,
      message: `Admin with id ${id} updated successfully`,
      updatedAdminId: id,
    };
  }

  async remove(id: number) {
    const { count } = await this.prisma.admin.deleteMany({
      where: { id },
    });
    if (count === 0) {
      throw new NotFoundException(`Admin with id ${id} not found`);
    }

    return {
      statusCode: 200,
      message: `Admin with id ${id} deleted successfully`,
      deletedAdminId: id,
    };
  }
}
